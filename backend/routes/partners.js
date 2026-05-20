const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'partners',
  fields: ['partner_id','name','type','country','contribution_usd','status','notes'],
});
