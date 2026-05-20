const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'nurseries',
  fields: ['nursery_id','site_id','type','frags_count','established_at','status','notes'],
});
