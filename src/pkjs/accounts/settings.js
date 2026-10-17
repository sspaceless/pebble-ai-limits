var C = require('../resources/accounts/settings');
var providers = require('../providers');
var direct = require('../providers/codex');
var store = require('./store');
var record = require('./record');

var load = store.load;
var write = store.write;

var label = record.label;

function applySettings(draft, connectId) {
  if (!draft || !Array.isArray(draft.accounts)) {
    throw new Error(C.ERROR_INVALID_SETTINGS);
  }

  var state = load();
  var ids = [];
  var mapped = {};
  var records = draft.accounts.map(function (a) {
    if (!a || typeof a.id !== 'string' || ids.indexOf(a.id) !== -1 || !providers.info(a.provider)) {
      throw new Error(C.ERROR_INVALID_ACCOUNT);
    }

    ids.push(a.id);
    var name = label(a.label);
    var existing = state.accounts.filter(function (row) {
      return row.id === a.id;
    })[0];
    var config = a.connectionData
      ? a.provider === C.PROVIDER_CODEX
        ? direct.tokens(a.connectionData, existing && existing.config)
        : providers.parseConfig(a.provider, a.connectionData)
      : null;

    if (existing) {
      if (existing.provider !== a.provider) {
        throw new Error(C.ERROR_ACCOUNT_MISMATCH);
      }

      existing.label = name;

      if (config) {
        existing.config = config;
        existing.revision++;
        existing.snapshot = null;
      }

      return existing;
    }

    if (a.id.indexOf(C.DRAFT_ACCOUNT_PREFIX) !== 0) {
      throw new Error(C.ERROR_ACCOUNT_NO_LONGER_EXISTS);
    }

    var id = record.identifier(a.provider);

    mapped[a.id] = id;

    return record.create(a.provider, id, name, config);
  });

  if (connectId && ids.indexOf(connectId) === -1) {
    throw new Error(C.ERROR_MISSING_CONNECTION_ACCOUNT);
  }

  if (draft.selectedId && ids.indexOf(draft.selectedId) === -1) {
    throw new Error(C.ERROR_INVALID_SELECTION);
  }

  if (!records.length) {
    records.push(
      record.create(
        C.PROVIDER_CODEX,
        C.DEFAULT_CODEX_ID_PREFIX + Date.now().toString(C.IDENTIFIER_RADIX),
        C.DEFAULT_ACCOUNT_LABEL
      )
    );
  }

  state.accounts = records;
  state.selectedId = mapped[draft.selectedId] || draft.selectedId || records[0].id;
  write(state);

  return mapped[connectId] || connectId || null;
}

module.exports = applySettings;
