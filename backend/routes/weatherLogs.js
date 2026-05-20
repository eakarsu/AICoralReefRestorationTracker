const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'weather_logs',
  fields: ['log_id','site_id','ts','sea_state','visibility_m','swell_m','notes'],
});
