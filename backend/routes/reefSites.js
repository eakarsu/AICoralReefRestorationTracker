const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'reef_sites',
  fields: ['site_id','name','location','depth_m','area_m2','status','notes'],
});
