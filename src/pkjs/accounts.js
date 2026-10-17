/** Profile repository facade: callers share one storage/migration contract. */
var store = require('./accounts/store');
var queries = require('./accounts/queries');
var profiles = require('./accounts/profiles');
var credentials = require('./accounts/credentials');
var order = require('./accounts/order');

module.exports = {
  load: store.load,
  current: queries.current,
  get: queries.get,
  ordered: queries.ordered,
  view: queries.view,
  add: profiles.add,
  rename: profiles.rename,
  remove: profiles.remove,
  ensure: profiles.ensure,
  select: order.select,
  reorder: order.reorder,
  save: credentials.save,
  cache: credentials.cache,
  applySettings: require('./accounts/settings')
};
