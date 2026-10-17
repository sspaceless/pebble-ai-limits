var C = require('../resources/accounts/store');
var migrate = require('./migration');

var KEY = C.PROFILE_STORAGE_KEY;

/**
 * Read optional JSON storage without exposing parse or storage-access errors.
 * @param {string} key Companion localStorage key.
 * @returns {*} Parsed JSON, or null when the key is missing/unreadable/invalid.
 */
function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (_) {
    return null;
  }
}

/**
 * Persist the complete profile state under the current schema storage key.
 * @param {Object} state JSON-serializable state; retained/returned without cloning.
 * @returns {Object} The same state after a successful write.
 * @throws {Error} If serialization or localStorage writing fails.
 */
function write(state) {
  localStorage.setItem(KEY, JSON.stringify(state));

  return state;
}

/**
 * Load profile state, applying legacy migration/default initialization as needed.
 * @returns {Object} Current profile state with a nonempty account list.
 * @throws {Error} If migration cannot commit its state to localStorage.
 */
function load() {
  return migrate(read(KEY), read, write);
}

module.exports = { load: load, write: write };
