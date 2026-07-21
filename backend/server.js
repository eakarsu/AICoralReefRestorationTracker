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
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth (public)
app.use('/api/auth', require('./routes/auth'));

// Apply pass 7 — public citizen-science submission endpoint (no auth required).
// Must be mounted BEFORE authenticateToken so the public can submit observations.
if (process.env.ENABLE_PUBLIC_CITIZEN_SUBMISSIONS === 'true') app.use('/api/public/citizen-submissions', require('./routes/citizenPublic'));

// Everything below requires a Bearer token.
app.use('/api', authenticateToken);
app.use('/api/governed-fieldwork', require('./routes/governedFieldwork'));
if (process.env.ENABLE_LEGACY_GLOBAL_ROUTES !== 'true') {
  app.use('/api',(req,res)=>res.status(404).json({error:'legacy_routes_disabled',message:'Use /api/governed-fieldwork; legacy and provider routes require explicit review.'}));
} else {

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
app.use('/api/reef-heat-stress-plan', require('./routes/reefHeatStressPlan'));

// Apply pass 7 — full backlog mounts (BEFORE the listen / 404 fall-through).
app.use('/api/dive-logs',            require('./routes/diveLogs'));
app.use('/api/citizen-submissions',  require('./routes/citizenSubmissions'));
app.use('/api/fragment-lineage',     require('./routes/fragmentLineage'));
app.use('/api/noaa-crw',             require('./routes/noaaIngest'));
}

app.listen(PORT, () => {
  console.log(`\nAI Coral Reef Restoration Tracker API running on http://localhost:${PORT}\n`);
});
