const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'fish_counts',
  fields: ['count_id','site_id','species','count','observer','ts','notes'],
});
