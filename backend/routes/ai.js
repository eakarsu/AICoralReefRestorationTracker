const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const ai = require('../services/ai');

async function record(feature, input, output) {
  try {
    await pool.query(
      'INSERT INTO ai_results (feature, input, output) VALUES ($1, $2, $3)',
      [feature, input || {}, output || {}]
    );
  } catch (e) {
    console.warn(`[ai] failed to record ${feature}:`, e.message);
  }
}

// ============================================================
// Sample fills — coral reef restoration scenarios per verb (5 each).
// Maps 1:1 to field `key`s used by the frontend AI page components.
// ============================================================
const SAMPLES = {
  'bleaching-event-forecast': [
    { label: 'Looe Key (Florida Keys)',          values: { site_id: 'SITE-001', sst_notes: 'SST projected 30.4C with NOAA DHW=6.2 next 30d.' } },
    { label: "Glover's Atoll (Belize)",          values: { site_id: 'SITE-004', sst_notes: 'Trades dropping, lagoon stratification expected.' } },
    { label: 'Komodo Pink Beach (Indonesia)',    values: { site_id: 'SITE-008', sst_notes: 'IOD positive; SST anomaly +1.2C through June.' } },
    { label: 'Heron Island (GBR)',               values: { site_id: 'SITE-009', sst_notes: 'NOAA Coral Reef Watch alert level 1 forecast.' } },
    { label: 'Raja Ampat Wayag',                 values: { site_id: 'SITE-015', sst_notes: 'Active critical bleaching ongoing; need 60-day refugia plan.' } },
  ],
  'fragment-health-vision': [
    { label: 'Mixed nursery photo notes',        values: { notes: 'Photos show pale tips on Acropora cervicornis frames at NUR-001; minor turf algae on frames 3-5.' } },
    { label: 'Suspected disease',                values: { notes: 'White-band lesions advancing 1cm/day across two frags on FRG-0009.' } },
    { label: 'Predation pressure',               values: { notes: 'Coralliophila snails observed on 4 Pocillopora frags; suspected tissue loss > 30%.' } },
    { label: 'Healthy baseline',                 values: { notes: 'All frags show vibrant pigment, no algae, healthy polyp extension at NUR-015.' } },
    { label: 'Storm damage',                     values: { notes: 'Three frames toppled at NUR-005 after swell; recovered colonies fragmented further.' } },
  ],
  'survival-predict': [
    { label: 'Florida Keys outplants',           values: { site_filter: 'SITE-001,SITE-002', notes: 'Standard 12-month forecast' } },
    { label: 'Caribbean wall sites',             values: { site_filter: 'SITE-003,SITE-005', notes: 'Account for deeper outplants and predator pressure.' } },
    { label: 'Indo-Pacific lagoons',             values: { site_filter: 'SITE-008,SITE-009,SITE-010', notes: 'Include cyclone-season risk.' } },
    { label: 'New deployments 2026',             values: { site_filter: 'SITE-014,SITE-015', notes: 'Only outplants planted after 2026-01-01.' } },
    { label: 'All sites - default',              values: { site_filter: '', notes: '' } },
  ],
  'restoration-prioritize': [
    { label: 'Caribbean program ($2M cap)',      values: { region: 'Caribbean', budget_usd: 2000000, capacity_diver_days: 240 } },
    { label: 'Indo-Pacific ($3M cap)',           values: { region: 'Indo-Pacific', budget_usd: 3000000, capacity_diver_days: 360 } },
    { label: 'Western Indian Ocean ($1M)',       values: { region: 'Western Indian Ocean', budget_usd: 1000000, capacity_diver_days: 120 } },
    { label: 'All regions, balanced',            values: { region: 'All', budget_usd: 5000000, capacity_diver_days: 600 } },
    { label: 'Crisis triage - bleaching first',  values: { region: 'All', budget_usd: 1500000, capacity_diver_days: 180 } },
  ],
  'executive-brief': [
    { label: 'Default monthly brief',            values: { notes: '' } },
    { label: 'Bias toward donors',               values: { notes: 'Emphasize donor-relevant impact and stories.' } },
    { label: 'Bias toward science',              values: { notes: 'Emphasize publications, propagation success rates and methods.' } },
    { label: 'Crisis lens (bleaching)',          values: { notes: 'Frame around bleaching response and triage.' } },
    { label: 'Board prep - governance',          values: { notes: 'Frame around governance, audits, partner status.' } },
  ],
  'water-quality-anomaly': [
    { label: 'Last 30 days - all sites',         values: { window_days: 30, site_filter: '' } },
    { label: 'Florida Keys only',                values: { window_days: 30, site_filter: 'SITE-001,SITE-002' } },
    { label: 'Indo-Pacific bleaching sites',     values: { window_days: 30, site_filter: 'SITE-008,SITE-009,SITE-015' } },
    { label: 'Caribbean wall sites',             values: { window_days: 30, site_filter: 'SITE-003,SITE-005' } },
    { label: 'Last 7 days - rapid review',       values: { window_days: 7,  site_filter: '' } },
  ],
  'diver-safety-brief': [
    { label: 'Apo Reef nursery dive',            values: { site_id: 'SITE-014', target_depth_m: 11, planned_minutes: 55, divers: 'Mei Lin, Ravi Patel, Putu Wirawan', conditions: 'clear, 28C, calm seas' } },
    { label: 'Cane Bay wall - tech',             values: { site_id: 'SITE-005', target_depth_m: 32, planned_minutes: 25, divers: 'Imani Okafor, Sarah Bennet', conditions: 'rough, 27C, 2.4m swell' } },
    { label: "Glover's Atoll outplant",          values: { site_id: 'SITE-004', target_depth_m: 12, planned_minutes: 60, divers: 'Carlos Mendez, Lia Hernandez', conditions: 'calm, 29C, viz 14m' } },
    { label: 'Lizard Island survey',             values: { site_id: 'SITE-010', target_depth_m: 8,  planned_minutes: 70, divers: 'Owen Brooks, Sarah Bennet', conditions: 'overcast, 27C, viz 8m' } },
    { label: 'Bonaire night dive',               values: { site_id: 'SITE-007', target_depth_m: 14, planned_minutes: 45, divers: 'Jeroen Smit, Sasha Ramos', conditions: 'calm, 28C, night' } },
  ],
  'partner-impact-report': [
    { label: 'NOAA CRCP',                        values: { partner_id: 'PRT-001', period: 'FY26 Q3' } },
    { label: 'The Nature Conservancy',           values: { partner_id: 'PRT-002', period: 'FY26 H1' } },
    { label: 'Bezos Earth Fund',                 values: { partner_id: 'PRT-015', period: 'CY 2026 H1' } },
    { label: 'PROBLUE Trust Fund',               values: { partner_id: 'PRT-011', period: 'FY26 Q3' } },
    { label: 'Tiffany & Co. Foundation',         values: { partner_id: 'PRT-014', period: 'CY 2026 H1' } },
  ],
  'grant-application-draft': [
    { label: 'NSF OCE coral resilience',         values: { funder: 'NSF OCE', amount_usd: 750000, period: '2026-2029', aims: 'Quantify resilience of Acropora outplants under marine heatwaves.' } },
    { label: 'NOAA Coral Reef Conservation',     values: { funder: 'NOAA CRCP', amount_usd: 500000, period: '2026-2028', aims: 'Scale Florida Keys nurseries to 50k frags/year.' } },
    { label: 'EU Horizon Europe coral',          values: { funder: 'EU Horizon Europe', amount_usd: 1200000, period: '2026-2029', aims: 'Indo-Pacific assisted gene flow trial.' } },
    { label: 'Bezos Earth Fund x2',              values: { funder: 'Bezos Earth Fund', amount_usd: 2000000, period: '2026-2029', aims: 'Reef-scale restoration in Raja Ampat.' } },
    { label: 'Oceankind community',              values: { funder: 'Oceankind', amount_usd: 350000, period: '2026-2028', aims: 'Community-led restoration in Mafia Island.' } },
  ],
  'propagation-success-rate': [
    { label: 'All nurseries - current',          values: { window: 'last_180_days' } },
    { label: 'Florida Keys only',                values: { window: 'last_180_days', nursery_filter: 'NUR-001,NUR-002,NUR-003' } },
    { label: 'Indo-Pacific only',                values: { window: 'last_180_days', nursery_filter: 'NUR-008,NUR-009,NUR-014,NUR-015' } },
    { label: 'Land-based only',                  values: { window: 'last_180_days', nursery_filter: 'NUR-006,NUR-012' } },
    { label: 'Underperforming review',           values: { window: 'last_365_days', nursery_filter: 'NUR-012,NUR-013' } },
  ],
  'vessel-routing': [
    { label: 'Florida Keys day plan',            values: { day: '2026-05-20', sites: 'SITE-001,SITE-002', vessels: 'VES-001,VES-002' } },
    { label: 'Belize multi-site',                values: { day: '2026-05-21', sites: 'SITE-004',          vessels: 'VES-003' } },
    { label: 'GBR survey day',                   values: { day: '2026-05-22', sites: 'SITE-009,SITE-010', vessels: 'VES-007,VES-008' } },
    { label: 'Raja Ampat outplant',              values: { day: '2026-05-23', sites: 'SITE-015',          vessels: 'VES-013' } },
    { label: 'Bonaire / Roatan combined',        values: { day: '2026-05-24', sites: 'SITE-006,SITE-007', vessels: 'VES-004,VES-005' } },
  ],
  'weather-dive-window': [
    { label: 'Looe Key 72hr',                    values: { site_id: 'SITE-001', forecast_notes: 'Trough passing; winds 15-18 kt; seas 1.0-1.4m.' } },
    { label: 'Cane Bay wall',                    values: { site_id: 'SITE-005', forecast_notes: '20-25 kt trades, swell 2.0-2.5m, periods of squalls.' } },
    { label: 'Komodo Pink Beach',                values: { site_id: 'SITE-008', forecast_notes: 'Wet season; thunderstorms PM; mornings clear.' } },
    { label: 'Heron Island',                     values: { site_id: 'SITE-009', forecast_notes: 'High pressure ridge; calm seas; viz excellent.' } },
    { label: 'Mafia Island monsoon',             values: { site_id: 'SITE-013', forecast_notes: 'Monsoon runoff; turbidity > 5 NTU; choppy.' } },
  ],
  'species-id-fish': [
    { label: 'Vibrant blue tang school',         values: { description: 'School of ~60 vibrant blue tangs grazing on turf algae at 8m, Looe Key.' } },
    { label: 'Solitary grouper in cave',         values: { description: 'Single olive-brown grouper, ~70cm, in coral cave at 14m, Bonaire Salt Pier.' } },
    { label: 'Mass schooling fusiliers',         values: { description: 'Yellow-tail schooling fish, dense column ~200 individuals, Apo Reef wall.' } },
    { label: 'Damsel guarding nest',             values: { description: 'Black aggressive damsel ~10cm guarding patch of turf, Glover\'s Atoll.' } },
    { label: 'Cleaner wrasse station',           values: { description: 'Small blue / black striped wrasse at cleaning station with grouper client, Heron Island.' } },
  ],
  'publication-summary': [
    { label: 'PUB-2026-001 (Florida outplants)',  values: { pub_id: 'PUB-2026-001', audience: 'donor' } },
    { label: 'PUB-2026-002 (heat stress)',        values: { pub_id: 'PUB-2026-002', audience: 'media' } },
    { label: 'PUB-2026-003 (predation)',          values: { pub_id: 'PUB-2026-003', audience: 'policy' } },
    { label: 'PUB-2026-009 (Apo recruitment)',    values: { pub_id: 'PUB-2026-009', audience: 'donor' } },
    { label: 'PUB-2026-013 (diver safety)',       values: { pub_id: 'PUB-2026-013', audience: 'internal' } },
  ],
  'training-gap-analysis': [
    { label: 'All divers - 12 month',            values: { window_months: 12, role_filter: '' } },
    { label: 'Field divers only',                values: { window_months: 12, role_filter: 'field' } },
    { label: 'Volunteer cohort review',          values: { window_months: 6,  role_filter: 'volunteer' } },
    { label: 'New hires onboarding',             values: { window_months: 3,  role_filter: 'new_hire' } },
    { label: 'Long-tenured upskill',             values: { window_months: 24, role_filter: 'senior' } },
  ],
  'donor-narrative': [
    { label: 'Inspiring (Earth Day)',            values: { tone: 'inspiring',   audience: 'donors' } },
    { label: 'Urgent (bleaching crisis)',        values: { tone: 'urgent',      audience: 'donors' } },
    { label: 'Reflective (annual report)',       values: { tone: 'reflective',  audience: 'donors' } },
    { label: 'Confident (corporate funder)',     values: { tone: 'confident',   audience: 'corporate' } },
    { label: 'Heartfelt (community)',            values: { tone: 'heartfelt',   audience: 'community' } },
  ],
};

// GET /api/ai/samples?feature=<verb>
router.get('/samples', (req, res) => {
  try {
    const feature = (req.query.feature || '').toString();
    if (!feature) return res.json({ features: Object.keys(SAMPLES) });
    const samples = SAMPLES[feature];
    if (!samples) return res.status(404).json({ error: `unknown feature: ${feature}` });
    res.json({ feature, samples });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/ai/history?feature=<name>&limit=<n>
router.get('/history', async (req, res) => {
  try {
    const feature = (req.query.feature || '').toString();
    const limit = Math.min(parseInt(req.query.limit, 10) || 25, 200);
    let r;
    if (feature) {
      r = await pool.query(
        'SELECT id, feature, input, output, created_at FROM ai_results WHERE feature = $1 ORDER BY created_at DESC LIMIT $2',
        [feature, limit]
      );
    } else {
      r = await pool.query(
        'SELECT id, feature, input, output, created_at FROM ai_results ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
    }
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================================
// 1. POST /api/ai/bleaching-event-forecast { site_id?, sst_notes? }
// ============================================================
router.post('/bleaching-event-forecast', async (req, res) => {
  try {
    const { site_id, sst_notes } = req.body || {};
    let siteContext = { site_id: site_id || 'ANY' };
    if (site_id) {
      const s = await pool.query('SELECT * FROM reef_sites WHERE site_id = $1 LIMIT 1', [site_id]);
      const b = await pool.query('SELECT * FROM bleaching_events WHERE site_id = $1 ORDER BY started_at DESC LIMIT 10', [site_id]);
      const wq = await pool.query('SELECT * FROM water_quality WHERE site_id = $1 ORDER BY ts DESC LIMIT 10', [site_id]);
      siteContext = { site: s.rows[0] || null, history: b.rows, water_quality: wq.rows };
    }
    const result = await ai.bleachingEventForecast(siteContext, { notes: sst_notes || '' });
    await record('bleaching-event-forecast', { site_id, sst_notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. fragment-health-vision { notes?, frag_ids? }
router.post('/fragment-health-vision', async (req, res) => {
  try {
    const { notes, frag_ids } = req.body || {};
    let fragmentRows = [];
    if (Array.isArray(frag_ids) && frag_ids.length > 0) {
      const r = await pool.query('SELECT * FROM fragments WHERE frag_id = ANY($1)', [frag_ids]);
      fragmentRows = r.rows;
    } else {
      const r = await pool.query('SELECT * FROM fragments ORDER BY id ASC LIMIT 10');
      fragmentRows = r.rows;
    }
    const result = await ai.fragmentHealthVision(notes, fragmentRows);
    await record('fragment-health-vision', { notes, count: fragmentRows.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. survival-predict { site_filter?, notes? }
router.post('/survival-predict', async (req, res) => {
  try {
    const { site_filter, notes } = req.body || {};
    let q = 'SELECT * FROM outplants';
    const args = [];
    if (site_filter) {
      const sites = String(site_filter).split(',').map((s) => s.trim()).filter(Boolean);
      if (sites.length > 0) {
        q += ' WHERE site_id = ANY($1)';
        args.push(sites);
      }
    }
    q += ' ORDER BY planted_at DESC LIMIT 40';
    const out = await pool.query(q, args);
    const result = await ai.survivalPredict(out.rows, { notes: notes || '' });
    await record('survival-predict', { site_filter, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. restoration-prioritize { region?, budget_usd?, capacity_diver_days? }
router.post('/restoration-prioritize', async (req, res) => {
  try {
    const { region, budget_usd, capacity_diver_days } = req.body || {};
    const s = await pool.query('SELECT * FROM reef_sites ORDER BY id ASC');
    const result = await ai.restorationPrioritize(
      s.rows,
      { region: region || 'all', budget_usd: Number(budget_usd) || 0, capacity_diver_days: Number(capacity_diver_days) || 0 }
    );
    await record('restoration-prioritize', { region, budget_usd, capacity_diver_days }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 5. executive-brief { notes? }
router.post('/executive-brief', async (req, res) => {
  try {
    const [s, o, b, p, g] = await Promise.all([
      pool.query("SELECT COUNT(*) FILTER (WHERE status='active') AS active, COUNT(*) FILTER (WHERE status='monitored') AS monitored, COUNT(*) FILTER (WHERE status='restricted') AS restricted, COUNT(*) AS total FROM reef_sites"),
      pool.query("SELECT COUNT(*) FILTER (WHERE survivor_status='alive') AS alive, COUNT(*) FILTER (WHERE survivor_status='partial') AS partial, COUNT(*) FILTER (WHERE survivor_status='dead') AS dead, COUNT(*) AS total FROM outplants"),
      pool.query("SELECT COUNT(*) FILTER (WHERE severity='critical') AS critical, COUNT(*) FILTER (WHERE severity='high') AS high, COUNT(*) AS total FROM bleaching_events"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(contribution_usd),0) AS total_usd FROM partners"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='active') AS active, COALESCE(SUM(amount_usd),0) AS total_usd FROM grants"),
    ]);
    const snapshot = {
      reef_sites: s.rows[0],
      outplants: o.rows[0],
      bleaching: b.rows[0],
      partners: p.rows[0],
      grants: g.rows[0],
      ...(req.body?.notes ? { notes: req.body.notes } : {}),
    };
    const result = await ai.executiveBrief(snapshot);
    const out = { snapshot, brief: result };
    await record('executive-brief', { notes: req.body?.notes || null }, out);
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 6. water-quality-anomaly { window_days?, site_filter? }
router.post('/water-quality-anomaly', async (req, res) => {
  try {
    const { window_days, site_filter } = req.body || {};
    const days = Number(window_days) || 30;
    let q = 'SELECT * FROM water_quality WHERE ts >= NOW() - ($1 || \' days\')::interval';
    const args = [String(days)];
    if (site_filter) {
      const sites = String(site_filter).split(',').map((s) => s.trim()).filter(Boolean);
      if (sites.length > 0) {
        q += ' AND site_id = ANY($2)';
        args.push(sites);
      }
    }
    q += ' ORDER BY ts DESC LIMIT 60';
    const r = await pool.query(q, args);
    const readings = r.rows.length > 0 ? r.rows
      : (await pool.query('SELECT * FROM water_quality ORDER BY ts DESC LIMIT 60')).rows;
    const result = await ai.waterQualityAnomaly(readings);
    await record('water-quality-anomaly', { window_days, site_filter, count: readings.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 7. diver-safety-brief { site_id, target_depth_m, planned_minutes, divers, conditions }
router.post('/diver-safety-brief', async (req, res) => {
  try {
    const planned = req.body || {};
    if (!planned.site_id) return res.status(400).json({ error: 'site_id is required' });
    const result = await ai.diverSafetyBrief(planned);
    await record('diver-safety-brief', planned, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 8. partner-impact-report { partner_id, period? }
router.post('/partner-impact-report', async (req, res) => {
  try {
    const { partner_id, period } = req.body || {};
    if (!partner_id) return res.status(400).json({ error: 'partner_id is required' });
    const p = await pool.query('SELECT * FROM partners WHERE partner_id = $1 LIMIT 1', [partner_id]);
    const g = await pool.query('SELECT * FROM grants WHERE funder ILIKE $1 LIMIT 5', [`%${(p.rows[0]?.name || '').split(' ')[0] || partner_id}%`]);
    const result = await ai.partnerImpactReport(partner_id, { partner: p.rows[0] || null, grants: g.rows, period: period || 'last_quarter' });
    await record('partner-impact-report', { partner_id, period }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 9. grant-application-draft { funder, amount_usd, period, aims }
router.post('/grant-application-draft', async (req, res) => {
  try {
    const opp = req.body || {};
    if (!opp.funder) return res.status(400).json({ error: 'funder is required' });
    const sites = await pool.query('SELECT COUNT(*) AS active_sites FROM reef_sites WHERE status=\'active\'');
    const out  = await pool.query("SELECT COUNT(*) AS alive FROM outplants WHERE survivor_status='alive'");
    const result = await ai.grantApplicationDraft(opp, { active_sites: Number(sites.rows[0].active_sites), alive_outplants: Number(out.rows[0].alive) });
    await record('grant-application-draft', opp, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 10. propagation-success-rate { window?, nursery_filter? }
router.post('/propagation-success-rate', async (req, res) => {
  try {
    const { nursery_filter } = req.body || {};
    let q = 'SELECT * FROM propagation_runs';
    const args = [];
    if (nursery_filter) {
      const n = String(nursery_filter).split(',').map((s) => s.trim()).filter(Boolean);
      if (n.length > 0) {
        q += ' WHERE nursery_id = ANY($1)';
        args.push(n);
      }
    }
    q += ' ORDER BY started_at DESC LIMIT 60';
    const r = await pool.query(q, args);
    const result = await ai.propagationSuccessRate(r.rows);
    await record('propagation-success-rate', { nursery_filter, count: r.rows.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 11. vessel-routing { day, sites, vessels }
router.post('/vessel-routing', async (req, res) => {
  try {
    const { day, sites, vessels } = req.body || {};
    if (!sites || !vessels) return res.status(400).json({ error: 'sites and vessels are required' });
    const siteList = String(sites).split(',').map((s) => s.trim()).filter(Boolean);
    const vesList  = String(vessels).split(',').map((s) => s.trim()).filter(Boolean);
    const sRows = await pool.query('SELECT * FROM reef_sites WHERE site_id = ANY($1)', [siteList]);
    const vRows = await pool.query('SELECT * FROM vessels WHERE vessel_id = ANY($1)', [vesList]);
    const result = await ai.vesselRouting(
      sRows.rows.map((r) => ({ site_id: r.site_id, name: r.name, location: r.location, depth_m: r.depth_m, day })),
      vRows.rows
    );
    await record('vessel-routing', { day, sites, vessels }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 12. weather-dive-window { site_id, forecast_notes }
router.post('/weather-dive-window', async (req, res) => {
  try {
    const { site_id, forecast_notes } = req.body || {};
    if (!site_id) return res.status(400).json({ error: 'site_id is required' });
    const w = await pool.query('SELECT * FROM weather_logs WHERE site_id = $1 ORDER BY ts DESC LIMIT 8', [site_id]);
    const result = await ai.weatherDiveWindow(site_id, { recent_logs: w.rows, forecast_notes: forecast_notes || '' });
    await record('weather-dive-window', { site_id, forecast_notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 13. species-id-fish { description }
router.post('/species-id-fish', async (req, res) => {
  try {
    const { description, site_id } = req.body || {};
    if (!description) return res.status(400).json({ error: 'description is required' });
    let recent = [];
    if (site_id) {
      const r = await pool.query('SELECT * FROM fish_counts WHERE site_id = $1 ORDER BY ts DESC LIMIT 10', [site_id]);
      recent = r.rows;
    }
    const result = await ai.speciesIdFish(description, recent);
    await record('species-id-fish', { description, site_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 14. publication-summary { pub_id, audience }
router.post('/publication-summary', async (req, res) => {
  try {
    const { pub_id, audience } = req.body || {};
    if (!pub_id) return res.status(400).json({ error: 'pub_id is required' });
    const p = await pool.query('SELECT * FROM publications WHERE pub_id = $1 LIMIT 1', [pub_id]);
    if (!p.rows.length) return res.status(404).json({ error: `publication not found: ${pub_id}` });
    const result = await ai.publicationSummary(p.rows[0], audience || 'donor');
    await record('publication-summary', { pub_id, audience }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 15. training-gap-analysis { window_months?, role_filter? }
router.post('/training-gap-analysis', async (req, res) => {
  try {
    const { window_months, role_filter } = req.body || {};
    const d = await pool.query('SELECT * FROM divers ORDER BY id ASC');
    const s = await pool.query('SELECT * FROM training_sessions ORDER BY date DESC LIMIT 25');
    const result = await ai.trainingGapAnalysis(d.rows, s.rows);
    await record('training-gap-analysis', { window_months, role_filter }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 16. donor-narrative { tone?, audience? }
router.post('/donor-narrative', async (req, res) => {
  try {
    const { tone, audience } = req.body || {};
    const [o, b, p] = await Promise.all([
      pool.query("SELECT COUNT(*) FILTER (WHERE survivor_status='alive') AS alive, COUNT(*) AS total FROM outplants"),
      pool.query("SELECT COUNT(*) FILTER (WHERE severity='critical') AS critical, COUNT(*) AS total FROM bleaching_events"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(contribution_usd),0) AS total_usd FROM partners"),
    ]);
    const metrics = { outplants: o.rows[0], bleaching: b.rows[0], partners: p.rows[0], audience: audience || 'donors' };
    const result = await ai.donorNarrative(metrics, tone || 'inspiring');
    await record('donor-narrative', { tone, audience }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
