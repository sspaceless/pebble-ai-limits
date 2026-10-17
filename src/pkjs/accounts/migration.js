var C = require('../resources/accounts/migration');
var providers = require('../providers');

function catalogOrder(state) {
  var rows = [];

  providers.catalog.forEach(function (p) {
    state.accounts.forEach(function (a) {
      if (a.provider === p.id) {
        rows.push(a);
      }
    });
  });

  return rows;
}

function migrate(previousState, read, write) {
  var state = previousState;

  if (
    state &&
    state.version === C.PROFILE_SCHEMA_VERSION &&
    Array.isArray(state.accounts) &&
    state.accounts.length
  ) {
    if (!state.accountOrderVersion) {
      state.accounts = catalogOrder(state);
      state.accountOrderVersion = 1;
      write(state);
    }

    return state;
  }

  var oldSelected = read(C.LEGACY_SELECTION_KEY) || C.PROVIDER_CODEX;

  state = {
    version: C.PROFILE_SCHEMA_VERSION,
    accountOrderVersion: 1,
    selectedId: null,
    accounts: []
  };
  providers.catalog.forEach(function (p) {
    var old = read(
      p.id === C.PROVIDER_CODEX
        ? C.LEGACY_CODEX_KEY
        : C.LEGACY_PROVIDER_KEY_PREFIX + p.id + C.LEGACY_PROVIDER_KEY_SUFFIX
    );

    if (old && old.mode === C.CONNECTION_MODE_DIRECT) {
      var a = {
        id: p.id + C.DEFAULT_ACCOUNT_ID_SUFFIX,
        provider: p.id,
        label: C.DEFAULT_ACCOUNT_LABEL,
        config: old,
        revision: 1,
        snapshot: null
      };

      state.accounts.push(a);

      if (p.id === oldSelected) {
        state.selectedId = a.id;
      }
    }
  });

  if (!state.accounts.length) {
    state.accounts.push({
      id: C.DEFAULT_CODEX_ID,
      provider: C.PROVIDER_CODEX,
      label: C.DEFAULT_ACCOUNT_LABEL,
      config: null,
      revision: 0,
      snapshot: null
    });
  }

  if (!state.selectedId) {
    state.selectedId = state.accounts[0].id;
  }

  // Commit the complete migration before deleting any legacy credentials.
  write(state);
  localStorage.removeItem(C.LEGACY_CODEX_KEY);
  localStorage.removeItem(C.LEGACY_SELECTION_KEY);
  providers.catalog.forEach(function (p) {
    if (p.id !== C.PROVIDER_CODEX) {
      localStorage.removeItem(C.LEGACY_PROVIDER_KEY_PREFIX + p.id + C.LEGACY_PROVIDER_KEY_SUFFIX);
    }
  });

  return state;
}

module.exports = migrate;
