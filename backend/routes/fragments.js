const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'fragments',
  fields: ['frag_id','nursery_id','species','source_colony','age_months','health_score','notes'],
});
