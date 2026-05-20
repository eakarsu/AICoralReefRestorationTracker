const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'bleaching_events',
  fields: ['event_id','site_id','severity','started_at','ended_at','bleached_pct','notes'],
});
