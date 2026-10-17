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
  var state = load();

  return (
    state.accounts.filter(function (a) {
      return a.id === id;
    })[0] || null
  );
}

/**
 * Resolve the selected profile, falling back to the first saved account.
 * Loading may initialize or migrate legacy storage.
 * @returns {Object} Selected or fallback profile, including its private configuration.
 */
function current() {
  var state = load();

  return get(state.selectedId) || ordered(state)[0];
}

/**
 * Create a credential-free profile list for configuration-page composition.
 * @returns {Object} Public state with selectedId and account IDs, providers, labels and connection flags.
 */
function view() {
  var state = load();

  return {
    selectedId: current().id,
    accounts: ordered(state).map(function (a) {
      return { id: a.id, provider: a.provider, label: a.label, configured: !!a.config };
    })
  };
}

module.exports = { get: get, current: current, ordered: ordered, view: view };
