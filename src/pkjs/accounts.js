var providers = require('./providers');
var direct = require('./direct');
var KEY = 'ai-profiles-v2';
function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (_) {
    return null;
  }
}
function write(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}
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
function ordered(state) {
  return state.accounts.slice();
}
function load() {
  var state = read(KEY);
  if (state && state.version === 2 && Array.isArray(state.accounts) && state.accounts.length) {
    if (!state.accountOrderVersion) {
      state.accounts = catalogOrder(state);
      state.accountOrderVersion = 1;
      write(state);
    }
    return state;
  }
  var oldSelected = read('ai-selected-v1') || 'codex';
  state = { version: 2, accountOrderVersion: 1, selectedId: null, accounts: [] };
  providers.catalog.forEach(function (p) {
    var old = read(p.id === 'codex' ? 'codex-connection-v2' : 'ai-account-' + p.id + '-v1');
    if (old && old.mode === 'direct') {
      var a = {
        id: p.id + '-default',
        provider: p.id,
        label: 'Personal',
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
      id: 'codex-default',
      provider: 'codex',
      label: 'Personal',
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
  localStorage.removeItem('codex-connection-v2');
  localStorage.removeItem('ai-selected-v1');
  providers.catalog.forEach(function (p) {
    if (p.id !== 'codex') {
      localStorage.removeItem('ai-account-' + p.id + '-v1');
    }
  });
  return state;
}
function get(id) {
  var state = load();
  return (
    state.accounts.filter(function (a) {
      return a.id === id;
    })[0] || null
  );
}
function current() {
  var state = load();
  return get(state.selectedId) || ordered(state)[0];
}
function label(value) {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.trim().length > 16 ||
    // eslint-disable-next-line no-control-regex -- Strip control characters from account names.
    /[\x00-\x1f\x7f]/.test(value)
  ) {
    throw new Error('Use a name of 1–16 characters');
  }
  return value.trim();
}
function add(provider, name) {
  if (!providers.info(provider)) {
    throw new Error('Unknown provider');
  }
  var state = load();
  var id;
  do {
    id = provider + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  } while (
    state.accounts.some(function (a) {
      return a.id === id;
    })
  );
  var record = {
    id: id,
    provider: provider,
    label: label(name),
    config: null,
    revision: 0,
    snapshot: null
  };
  state.accounts.push(record);
  state.selectedId = id;
  write(state);
  return record;
}
function select(id) {
  var state = load();
  if (
    !state.accounts.some(function (a) {
      return a.id === id;
    })
  ) {
    throw new Error('Account not found');
  }
  state.selectedId = id;
  write(state);
  return get(id);
}
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
function applySettings(draft, connectId) {
  if (!draft || !Array.isArray(draft.accounts)) {
    throw new Error('Invalid settings');
  }
  var state = load(),
    ids = [],
    mapped = {},
    records = draft.accounts.map(function (a) {
      if (
        !a ||
        typeof a.id !== 'string' ||
        ids.indexOf(a.id) !== -1 ||
        !providers.info(a.provider)
      ) {
        throw new Error('Invalid account');
      }
      ids.push(a.id);
      var name = label(a.label),
        existing = state.accounts.filter(function (row) {
          return row.id === a.id;
        })[0],
        config = a.connectionData
          ? a.provider === 'codex'
            ? direct.tokens(a.connectionData, existing && existing.config)
            : providers.parseConfig(a.provider, a.connectionData)
          : null;
      if (existing) {
        if (existing.provider !== a.provider) {
          throw new Error('Account mismatch');
        }
        existing.label = name;
        if (config) {
          existing.config = config;
          existing.revision++;
          existing.snapshot = null;
        }
        return existing;
      }
      if (a.id.indexOf('draft-') !== 0) {
        throw new Error('Account no longer exists');
      }
      var id =
        a.provider + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
      mapped[a.id] = id;
      return {
        id: id,
        provider: a.provider,
        label: name,
        config: config,
        revision: config ? 1 : 0,
        snapshot: null
      };
    });
  if (connectId && ids.indexOf(connectId) === -1) {
    throw new Error('Missing connection account');
  }
  if (draft.selectedId && ids.indexOf(draft.selectedId) === -1) {
    throw new Error('Invalid selection');
  }
  if (!records.length) {
    records.push({
      id: 'codex-default-' + Date.now().toString(36),
      provider: 'codex',
      label: 'Personal',
      config: null,
      revision: 0,
      snapshot: null
    });
  }
  state.accounts = records;
  state.selectedId = mapped[draft.selectedId] || draft.selectedId || records[0].id;
  write(state);
  return mapped[connectId] || connectId || null;
}
function reorder(ids) {
  var state = load();
  if (
    !Array.isArray(ids) ||
    ids.length !== state.accounts.length ||
    ids.some(function (id, i) {
      return (
        typeof id !== 'string' ||
        ids.indexOf(id) !== i ||
        !state.accounts.some(function (a) {
          return a.id === id;
        })
      );
    })
  ) {
    throw new Error('Invalid account order');
  }
  state.accounts = ids.map(function (id) {
    return state.accounts.filter(function (a) {
      return a.id === id;
    })[0];
  });
  write(state);
}
function rename(id, name) {
  var state = load();
  var record = state.accounts.filter(function (a) {
    return a.id === id;
  })[0];
  if (!record) {
    throw new Error('Account not found');
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
    state.accounts.push({
      id: 'codex-default-' + Date.now().toString(36),
      provider: 'codex',
      label: 'Personal',
      config: null,
      revision: 0,
      snapshot: null
    });
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
  record = add(provider, 'Personal');
  select(selectedId);
  return record;
}
function view() {
  var state = load();
  return {
    selectedId: current().id,
    accounts: ordered(state).map(function (a) {
      return { id: a.id, provider: a.provider, label: a.label, configured: !!a.config };
    })
  };
}
module.exports = {
  load: load,
  current: current,
  get: get,
  add: add,
  select: select,
  save: save,
  cache: cache,
  rename: rename,
  remove: remove,
  ensure: ensure,
  view: view,
  ordered: ordered,
  reorder: reorder,
  applySettings: applySettings
};
