const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'outplants',
  fields: ['outplant_id','site_id','frag_id','planted_at','survivor_status','last_check','notes'],
});
