// Apply pass 7 — Citizen-science portal PUBLIC submission endpoint.
//
// Mounted before authenticateToken so unauthenticated members of the public
// can submit observations. Rate-limited by a tiny in-memory bucket (no new deps).
// All submissions land with moderation_status = 'pending'.

const express = require('express');
const pool = require('../config/database');
const { fireWebhook } = require('../services/webhooks');

const router = express.Router();

const buckets = new Map();
function rateLimit(ip, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const rec = buckets.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > rec.resetAt) { rec.count = 0; rec.resetAt = now + windowMs; }
  rec.count++;
  buckets.set(ip, rec);
  return rec.count <= limit;
}

// POST /api/public/citizen-submissions
router.post('/', async (req, res) => {
  try {
    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'anon').toString();
    if (!rateLimit(ip)) {
      return res.status(429).json({ error: 'rate limit exceeded; try again in a minute' });
    }
    const f = req.body || {};
    if (!f.description && !f.observation_type && !f.species) {
      return res.status(400).json({ error: 'at least description, observation_type, or species is required' });
    }
    const r = await pool.query(
      `INSERT INTO citizen_submissions (
         submission_id, submitter_name, submitter_email, site_id, observed_at,
         observation_type, species, description, photo_url,
         latitude, longitude, moderation_status, reward_points
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending',0) RETURNING id, submission_id, moderation_status, created_at`,
      [
        f.submission_id || `CIT-${Date.now()}`,
        f.submitter_name || null,
        f.submitter_email || null,
        f.site_id || null,
        f.observed_at || null,
        f.observation_type || 'other',
        f.species || null,
        f.description || null,
        f.photo_url || null,
        f.latitude == null ? null : Number(f.latitude),
        f.longitude == null ? null : Number(f.longitude),
      ]
    );
    fireWebhook('citizen_submission.received', { row: r.rows[0] }).catch(() => {});
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
