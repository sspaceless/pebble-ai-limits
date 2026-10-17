var load = require('./store').load;

/**
 * Return account order without exposing the stored array for reordering.
 * @param {Object} state Profile state containing accounts in saved order.
 * @returns {Object[]} Shallow array copy; profile objects are not cloned.
 */
function ordered(state) {
  return state.accounts.slice();
}

/**
 * Look up a profile after loading/migrating stored state.
 * @param {string} id Local profile ID.
 * @returns {?Object} Loaded profile record, or null when no matching ID exists.
 */
function get(id) {
  return find(load(), id);
}

// Resolve against one loaded state; avoid parsing the entire profile store again.
function find(state, id) {
  for (var i = 0; i < state.accounts.length; i++) {
    if (state.accounts[i].id === id) {
      return state.accounts[i];
    }
  }

  return null;
}

/**
 * Resolve the selected profile, falling back to the first saved account.
 * Loading may initialize or migrate legacy storage.
 * @returns {Object} Selected or fallback profile, including its private configuration.
 */
function current() {
  var state = load();

  return find(state, state.selectedId) || state.accounts[0];
}

/**
 * Create a credential-free profile list for configuration-page composition.
 * @returns {Object} Public state with selectedId and account IDs, providers, labels and connection flags.
 */
function view() {
  var state = load();

  return {
    selectedId: (find(state, state.selectedId) || state.accounts[0]).id,
    accounts: state.accounts.map(function (a) {
      return { id: a.id, provider: a.provider, label: a.label, configured: !!a.config };
    })
  };
}

module.exports = { get: get, current: current, ordered: ordered, view: view };
