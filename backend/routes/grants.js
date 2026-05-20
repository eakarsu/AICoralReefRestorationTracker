const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'grants',
  fields: ['grant_id','funder','amount_usd','period','status','owner','notes'],
});
