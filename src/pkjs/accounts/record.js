var C = require('../resources/accounts/record');
var validName = require('../validation/account-name');

/**
 * Validate and trim an account display name before persisting it.
 * @param {*} value Candidate name.
 * @returns {string} Trimmed name satisfying the shared account-name contract.
 * @throws {Error} If the value is not a valid account name.
 */
function label(value) {
  if (!validName(value)) {
    throw new Error(C.ERROR_USE_A_NAME_OF_1_16_CHARACTERS);
  }

  return value.trim();
}

/**
 * Construct a disconnected or connected profile record without writing storage.
 * The caller validates provider/name/ID; the configuration is retained by reference.
 * @param {string} provider Provider catalog ID.
 * @param {string} id Local profile ID.
 * @param {string} name Already validated display name.
 * @param {?Object} [config] Provider credentials/configuration, or null when disconnected.
 * @returns {Object} Fresh record with initial revision and no cached snapshot.
 */
function create(provider, id, name, config) {
  return {
    id: id,
    provider: provider,
    label: name,
    config: config || null,
    revision: config ? 1 : 0,
    snapshot: null
  };
}

/**
 * Generate a local account ID from a provider prefix, time, and random suffix.
 * IDs are not security tokens; callers must check collisions against stored profiles.
 * @param {string} provider Provider ID used as the prefix.
 * @returns {string} Candidate local profile ID.
 */
function identifier(provider) {
  return (
    provider +
    C.HYPHEN +
    Date.now().toString(C.IDENTIFIER_RADIX) +
    C.HYPHEN +
    Math.random().toString(C.IDENTIFIER_RADIX).slice(C.RANDOM_PREFIX_LENGTH, C.RANDOM_SUFFIX_END)
  );
}

module.exports = { label: label, create: create, identifier: identifier };
