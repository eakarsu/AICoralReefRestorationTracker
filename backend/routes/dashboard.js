const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [
      sites, nurseries, fragments, outplants, visits, bleach, wq, fish,
      divers, equipment, weather, partners, grants, pubs, trainings,
      vessels, props, audit,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active, COUNT(*) FILTER (WHERE status='restricted') AS restricted FROM reef_sites"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active, COALESCE(SUM(frags_count),0) AS total_frags FROM nurseries"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(ROUND(AVG(health_score)::numeric,1),0) AS avg_health FROM fragments"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE survivor_status='alive') AS alive, COUNT(*) FILTER (WHERE survivor_status='dead') AS dead FROM outplants"),
      pool.query("SELECT COUNT(*) AS total FROM monitoring_visits"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE severity='critical') AS critical, COUNT(*) FILTER (WHERE severity='high') AS high FROM bleaching_events"),
      pool.query("SELECT COUNT(*) AS total FROM water_quality"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(count),0) AS total_count FROM fish_counts"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active, COUNT(*) FILTER (WHERE status='medical_hold') AS medical_hold FROM divers"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='available') AS available, COUNT(*) FILTER (WHERE status='maintenance') AS maintenance FROM equipment"),
      pool.query("SELECT COUNT(*) AS total FROM weather_logs"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active, COALESCE(SUM(contribution_usd),0) AS total_usd FROM partners"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active, COALESCE(SUM(amount_usd),0) AS total_usd FROM grants"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='published') AS published, COUNT(*) FILTER (WHERE status='in_review') AS in_review FROM publications"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='planned') AS planned, COUNT(*) FILTER (WHERE status='completed') AS completed FROM training_sessions"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='available') AS available, COUNT(*) FILTER (WHERE status='in_use') AS in_use FROM vessels"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(ROUND(AVG(success_pct)::numeric,1),0) AS avg_success FROM propagation_runs"),
      pool.query("SELECT COUNT(*) AS total FROM audit_log"),
    ]);
    res.json({
      reef_sites:        sites.rows[0],
      nurseries:         nurseries.rows[0],
      fragments:         fragments.rows[0],
      outplants:         outplants.rows[0],
      monitoring_visits: visits.rows[0],
      bleaching_events:  bleach.rows[0],
      water_quality:     wq.rows[0],
      fish_counts:       fish.rows[0],
      divers:            divers.rows[0],
      equipment:         equipment.rows[0],
      weather_logs:      weather.rows[0],
      partners:          partners.rows[0],
      grants:            grants.rows[0],
      publications:      pubs.rows[0],
      training_sessions: trainings.rows[0],
      vessels:           vessels.rows[0],
      propagation_runs:  props.rows[0],
      audit_log:         audit.rows[0],
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
