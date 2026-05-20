const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { authenticateToken } = require('./middleware/auth');
const pool = require('./config/database');
const { fireWebhook } = require('./services/webhooks');

// Side-effect hook: turn critical bleaching events into a notification + webhook.
async function onBleachingEventCreated(row) {
  const sev = String(row.severity || '').toLowerCase();
  if (['critical', 'high'].includes(sev)) {
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, title, body, severity, source)
         VALUES (NULL, $1, $2, $3, $4)`,
        [`Bleaching event: ${row.event_id || 'new'}`,
         `${row.site_id || ''} - ${row.bleached_pct || 0}% bleached`.slice(0, 1000),
         sev,
         'bleaching_events']
      );
    } catch (e) { console.warn('[notify] bleaching insert failed:', e.message); }
    fireWebhook(`bleaching.${sev}`, { row }).catch(() => {});
  }
}

const app = express();
const PORT = process.env.BACKEND_PORT || 3079;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3078,http://localhost:3079,http://localhost:3000')
  .split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth (public)
app.use('/api/auth', require('./routes/auth'));

// Everything below requires a Bearer token.
app.use('/api', authenticateToken);

// Wrap bleaching events to fire on-create side effects
function withBleachingHook(innerRouter) {
  const wrapper = express.Router();
  wrapper.use((req, res, next) => {
    if (req.method !== 'POST') return next();
    const origJson = res.json.bind(res);
    res.json = (body) => {
      try {
        if (res.statusCode === 201 && body && body.id) {
          Promise.resolve(onBleachingEventCreated(body)).catch((e) =>
            console.warn('[server] onBleachingEventCreated failed:', e.message));
        }
      } catch (_) {}
      return origJson(body);
    };
    next();
  });
  wrapper.use(innerRouter);
  return wrapper;
}

// CRUD routes (18 domain entities)
app.use('/api/reef-sites',         require('./routes/reefSites'));
app.use('/api/nurseries',          require('./routes/nurseries'));
app.use('/api/fragments',          require('./routes/fragments'));
app.use('/api/outplants',          require('./routes/outplants'));
app.use('/api/monitoring-visits',  require('./routes/monitoringVisits'));
app.use('/api/bleaching-events',   withBleachingHook(require('./routes/bleachingEvents')));
app.use('/api/water-quality',      require('./routes/waterQuality'));
app.use('/api/fish-counts',        require('./routes/fishCounts'));
app.use('/api/divers',             require('./routes/divers'));
app.use('/api/equipment',          require('./routes/equipment'));
app.use('/api/weather-logs',       require('./routes/weatherLogs'));
app.use('/api/partners',           require('./routes/partners'));
app.use('/api/grants',             require('./routes/grants'));
app.use('/api/publications',       require('./routes/publications'));
app.use('/api/training-sessions',  require('./routes/trainingSessions'));
app.use('/api/vessels',            require('./routes/vessels'));
app.use('/api/propagation-runs',   require('./routes/propagationRuns'));
app.use('/api/audit-log',          require('./routes/auditLog'));

// AI routes (16 sub-endpoints + history under /api/ai)
app.use('/api/ai', require('./routes/ai'));

// Cross-cutting
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/attachments',   require('./routes/attachments'));
app.use('/api/webhooks',      require('./routes/webhooks'));

// Dashboard stats
app.use('/api/dashboard', require('./routes/dashboard'));

// Custom Views (Reef Analytics)
app.use('/api/custom-views', require('./routes/customViews'));

app.listen(PORT, () => {
  console.log(`\nAI Coral Reef Restoration Tracker API running on http://localhost:${PORT}\n`);
});
