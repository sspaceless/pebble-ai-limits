var C = require('../resources/accounts/profiles');
var providers = require('../providers/catalog');
var store = require('./store');
var queries = require('./queries');
var select = require('./order').select;
var records = require('./record');

var load = store.load;
var write = store.write;

var current = queries.current;
var ordered = queries.ordered;

var label = records.label;

function add(provider, name) {
  if (!providers.info(provider)) {
    throw new Error(C.ERROR_UNKNOWN_PROVIDER);
  }

  var state = load();
  var ids = state.accounts.map(function (account) {
    return account.id;
  });
  var id;

  do {
    id = records.identifier(provider);
  } while (ids.indexOf(id) !== -1);

  var created = records.create(provider, id, label(name));

  state.accounts.push(created);
  state.selectedId = id;
  write(state);

  return created;
}

function rename(id, name) {
  var state = load();
  var record = state.accounts.filter(function (a) {
    return a.id === id;
  })[0];

  if (!record) {
    throw new Error(C.ERROR_ACCOUNT_NOT_FOUND);
  }

  record.label = label(name);
  write(state);

  return record;
}

function remove(id) {
  var state = load();

  state.accounts = state.accounts.filter(function (a) {
    return a.id !== id;
  });

  if (!state.accounts.length) {
    state.accounts.push(
      records.create(
        C.PROVIDER_CODEX,
        C.DEFAULT_CODEX_ID_PREFIX + Date.now().toString(C.IDENTIFIER_RADIX),
        C.DEFAULT_ACCOUNT_LABEL
      )
    );
  }

  if (
    state.selectedId === id ||
    !state.accounts.some(function (a) {
      return a.id === state.selectedId;
    })
  ) {
    state.selectedId = (
      ordered(state).filter(function (a) {
        return !!a.config;
      })[0] || ordered(state)[0]
    ).id;
  }

  write(state);

  return current();
}

function ensure(provider) {
  var record = ordered(load()).filter(function (a) {
    return a.provider === provider;
  })[0];

  if (record) {
    return record;
  }

  var selectedId = current().id;

  record = add(provider, C.DEFAULT_ACCOUNT_LABEL);
  select(selectedId);

  return record;
}

module.exports = { add: add, rename: rename, remove: remove, ensure: ensure };
