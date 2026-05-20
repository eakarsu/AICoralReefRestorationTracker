const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'vessels',
  fields: ['vessel_id','name','capacity','fuel_status','location','status','notes'],
});
