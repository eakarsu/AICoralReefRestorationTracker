const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'water_quality',
  fields: ['reading_id','site_id','parameter','value','units','ts','notes'],
});
