var store = require('./store');

var load = store.load;
var write = store.write;

function save(id, config, expectedRevision, replace) {
  var state = load();
  var record = state.accounts.filter(function (a) {
    return a.id === id;
  })[0];

  if (!record || (expectedRevision !== undefined && record.revision !== expectedRevision)) {
    return null;
  }

  record.config = config;

  if (expectedRevision === undefined || replace) {
    record.revision++;
    record.snapshot = null;
  }

  write(state);

  return record;
}

function cache(id, data, revision) {
  var state = load();
  var record = state.accounts.filter(function (a) {
    return a.id === id;
  })[0];

  if (!record || record.revision !== revision) {
    return false;
  }

  record.snapshot = data;
  write(state);

  return true;
}

module.exports = { save: save, cache: cache };
