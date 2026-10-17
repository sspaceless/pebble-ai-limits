/** Explicit constant dependencies; these alone accompany the browser factory. */
var errors = require('../shared/errors');
var providers = require('../shared/providers');
var storage = require('../shared/storage');
var limits = require('../shared/limits');
var text = require('../shared/text');

module.exports = {
  ERROR_INVALID_SETTINGS: errors.ERROR_INVALID_SETTINGS,
  ERROR_INVALID_ACCOUNT: errors.ERROR_INVALID_ACCOUNT,
  PROVIDER_CODEX: providers.PROVIDER_CODEX,
  ERROR_ACCOUNT_MISMATCH: errors.ERROR_ACCOUNT_MISMATCH,
  DRAFT_ACCOUNT_PREFIX: storage.DRAFT_ACCOUNT_PREFIX,
  ERROR_ACCOUNT_NO_LONGER_EXISTS: errors.ERROR_ACCOUNT_NO_LONGER_EXISTS,
  ERROR_MISSING_CONNECTION_ACCOUNT: errors.ERROR_MISSING_CONNECTION_ACCOUNT,
  ERROR_INVALID_SELECTION: errors.ERROR_INVALID_SELECTION,
  DEFAULT_CODEX_ID_PREFIX: storage.DEFAULT_CODEX_ID_PREFIX,
  IDENTIFIER_RADIX: limits.IDENTIFIER_RADIX,
  DEFAULT_ACCOUNT_LABEL: text.DEFAULT_ACCOUNT_LABEL
};
