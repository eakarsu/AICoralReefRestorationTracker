const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'publications',
  fields: ['pub_id','title','authors','journal','year','status','notes'],
});
