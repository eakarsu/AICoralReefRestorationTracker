// Apply pass 7 — Citizen-science portal.
//
// Authenticated moderation + listing routes. The public submission endpoint
// lives in routes/citizenPublic.js so it can be mounted before authenticateToken
// without breaking the existing /api guard pattern.

const express = require('express');
const pool = require('../config/database');
const { requireWriter } = require('../middleware/auth');
const { fireWebhook } = require('../services/webhooks');

const router = express.Router();

// ----- List with optional moderation_status filter -----
router.get('/', async (req, res) => {
  try {
    const status = (req.query.status || '').toString().trim();
    let r;
    if (status) {
      r = await pool.query(
        'SELECT * FROM citizen_submissions WHERE moderation_status = $1 ORDER BY id DESC',
        [status]
      );
    } else {
      r = await pool.query('SELECT * FROM citizen_submissions ORDER BY id DESC');
    }
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ----- Moderation queue (pending only, oldest first) -----
router.get('/queue', async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM citizen_submissions WHERE moderation_status = 'pending' ORDER BY created_at ASC LIMIT 200"
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ----- Leaderboard (gamification) -----
router.get('/leaderboard', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT submitter_name, submitter_email,
              COUNT(*) AS submissions,
              COUNT(*) FILTER (WHERE moderation_status = 'approved') AS approved,
              COALESCE(SUM(reward_points), 0) AS total_points
       FROM citizen_submissions
       WHERE submitter_name IS NOT NULL
       GROUP BY submitter_name, submitter_email
       ORDER BY total_points DESC, approved DESC
       LIMIT 50`
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM citizen_submissions WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ----- Moderation action -----
router.post('/:id/moderate', requireWriter, async (req, res) => {
  try {
    const { decision, moderator_notes, reward_points } = req.body || {};
    const allowed = ['approved', 'rejected', 'needs_info', 'pending'];
    if (!allowed.includes(decision)) {
      return res.status(400).json({ error: `decision must be one of ${allowed.join(', ')}` });
    }
    const r = await pool.query(
      `UPDATE citizen_submissions
       SET moderation_status = $1,
           moderator_notes   = $2,
           reward_points     = COALESCE($3, reward_points),
           updated_at        = NOW()
       WHERE id = $4
       RETURNING *`,
      [decision, moderator_notes || null, reward_points == null ? null : Number(reward_points), req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'not found' });
    fireWebhook(`citizen_submission.${decision}`, { row: r.rows[0] }).catch(() => {});
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ----- Manual create (auth-gated; e.g. ingesting from a partner feed) -----
router.post('/', requireWriter, async (req, res) => {
  try {
    const f = req.body || {};
    const r = await pool.query(
      `INSERT INTO citizen_submissions (
         submission_id, submitter_name, submitter_email, site_id, observed_at,
         observation_type, species, description, photo_url,
         latitude, longitude, moderation_status, moderator_notes, reward_points
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
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
        f.moderation_status || 'pending',
        f.moderator_notes || null,
        f.reward_points == null ? 0 : Number(f.reward_points),
      ]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', requireWriter, async (req, res) => {
  try {
    const f = req.body || {};
    const r = await pool.query(
      `UPDATE citizen_submissions SET
         submitter_name   = $1,
         submitter_email  = $2,
         site_id          = $3,
         observed_at      = $4,
         observation_type = $5,
         species          = $6,
         description      = $7,
         photo_url        = $8,
         latitude         = $9,
         longitude        = $10,
         moderation_status= $11,
         moderator_notes  = $12,
         reward_points    = $13,
         updated_at       = NOW()
       WHERE id = $14
       RETURNING *`,
      [
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
        f.moderation_status || 'pending',
        f.moderator_notes || null,
        f.reward_points == null ? 0 : Number(f.reward_points),
        req.params.id,
      ]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', requireWriter, async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM citizen_submissions WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'not found' });
    res.json({ message: 'deleted', row: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
