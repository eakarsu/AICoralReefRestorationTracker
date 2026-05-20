const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'monitoring_visits',
  fields: ['visit_id','site_id','lead_diver','visit_at','conditions','findings'],
});
