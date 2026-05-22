const express = require('express');
const router = express.Router();

router.post('/score', (req, res) => {
  const body = req.body || {};
  const degreeHeatingWeeks = Number(body.degree_heating_weeks || 0);
  const tempAnomalyC = Number(body.temp_anomaly_c || 0);
  const recentBleachingPct = Number(body.recent_bleaching_pct || 0);
  const nurseryCapacity = Number(body.nursery_capacity || 0);
  const score = Math.max(0, Math.min(100, Math.round(degreeHeatingWeeks * 9 + tempAnomalyC * 14 + recentBleachingPct * 0.6 - nurseryCapacity * 0.05)));
  res.json({
    reef_site: body.reef_site || 'reef site',
    heat_stress_score: score,
    risk_band: score >= 70 ? 'critical' : score >= 40 ? 'watch' : 'stable',
    actions: [
      score >= 70 ? 'Pause nonessential outplanting and schedule bleaching survey.' : 'Continue planned monitoring cadence.',
      nurseryCapacity < 100 ? 'Stage additional nursery fragments for post-event recovery.' : 'Nursery capacity is sufficient for response buffer.',
      degreeHeatingWeeks >= 4 ? 'Prioritize heat-tolerant genotypes in next planting window.' : 'Keep current genotype mix.',
    ],
    generated_at: new Date().toISOString(),
  });
});

module.exports = router;
