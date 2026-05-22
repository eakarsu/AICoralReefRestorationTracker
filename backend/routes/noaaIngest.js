// Apply pass 7 — NOAA Coral Reef Watch ingest (NEEDS-CREDS stub).
//
// Real ingest would fetch SST/DHW/bleaching-alert tiles from NOAA CRW ERDDAP /
// THREDDS endpoints on a cron schedule. This stub returns 503 for trigger
// endpoints and exposes the ingest log table for visibility.
//
// Activation requires:
//   NOAA_CRW_ENABLED=true   (and optionally NOAA_CRW_BASE_URL, NOAA_CRW_REGION)
//
// No new dependencies are introduced; an activated build would still use the
// built-in `https` module.

const express = require('express');
const pool = require('../config/database');
const { requireWriter } = require('../middleware/auth');

const router = express.Router();

function isEnabled() {
  return String(process.env.NOAA_CRW_ENABLED || '').toLowerCase() === 'true';
}

// GET /api/noaa-crw/status — public-ish status (still behind auth gate)
router.get('/status', async (req, res) => {
  try {
    const enabled = isEnabled();
    const r = await pool.query(
      'SELECT * FROM noaa_crw_ingests ORDER BY started_at DESC LIMIT 1'
    );
    res.json({
      enabled,
      last_ingest: r.rows[0] || null,
      message: enabled
        ? 'NOAA Coral Reef Watch ingest enabled.'
        : 'NOAA Coral Reef Watch ingest disabled. Set NOAA_CRW_ENABLED=true (and optional NOAA_CRW_BASE_URL, NOAA_CRW_REGION) to activate the scheduled fetcher. No NOAA credentials are required, but the cron host must be reachable.',
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/noaa-crw/ingests — list past ingest runs
router.get('/ingests', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM noaa_crw_ingests ORDER BY started_at DESC LIMIT 200'
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/noaa-crw/trigger — manual ingest (503 if not configured)
router.post('/trigger', requireWriter, async (req, res) => {
  if (!isEnabled()) {
    // Log a skipped row so operators see why nothing happened.
    try {
      await pool.query(
        `INSERT INTO noaa_crw_ingests (ingest_id, dataset, region, status, finished_at, message)
         VALUES ($1, $2, $3, 'skipped', NOW(), $4)`,
        [
          `ING-${Date.now()}`,
          (req.body && req.body.dataset) || 'sst',
          (req.body && req.body.region) || 'global',
          'NOAA_CRW_ENABLED is not true; set env var to activate the scheduled fetcher.',
        ]
      );
    } catch (_) {}
    return res.status(503).json({
      error: 'NOAA Coral Reef Watch ingest is not configured.',
      action_required: 'Set NOAA_CRW_ENABLED=true (and optional NOAA_CRW_BASE_URL, NOAA_CRW_REGION) and restart the API.',
      docs: 'https://coralreefwatch.noaa.gov/satellite/index.php',
    });
  }
  // When enabled, a real fetcher would run here. We intentionally do not
  // call out to the network in this stub; we just log a pending row.
  try {
    const id = `ING-${Date.now()}`;
    const dataset = (req.body && req.body.dataset) || 'sst';
    const region = (req.body && req.body.region) || 'global';
    await pool.query(
      `INSERT INTO noaa_crw_ingests (ingest_id, dataset, region, status, message)
       VALUES ($1, $2, $3, 'pending', $4)`,
      [id, dataset, region, 'Manual trigger received; fetcher would run here.']
    );
    res.status(202).json({ ingest_id: id, dataset, region, status: 'pending' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/noaa-crw/schedule — register cron (503 if not configured)
router.post('/schedule', requireWriter, (req, res) => {
  if (!isEnabled()) {
    return res.status(503).json({
      error: 'NOAA Coral Reef Watch ingest is not configured.',
      action_required: 'Set NOAA_CRW_ENABLED=true and provide cron infra (e.g. node-cron or system crontab). This service does not ship a cron daemon.',
    });
  }
  res.status(501).json({
    error: 'Cron scheduling not implemented in-process. Use an external scheduler (system crontab, k8s CronJob) to call POST /api/noaa-crw/trigger.',
  });
});

module.exports = router;
