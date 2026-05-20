const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'propagation_runs',
  fields: ['run_id','nursery_id','fragments_added','success_pct','started_at','ended_at','notes'],
});
