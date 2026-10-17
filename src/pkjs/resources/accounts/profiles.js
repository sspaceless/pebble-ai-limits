/** Explicit constant dependencies; these alone accompany the browser factory. */
var errors = require('../shared/errors');
var storage = require('../shared/storage');
var limits = require('../shared/limits');
var providers = require('../shared/providers');
var text = require('../shared/text');

module.exports = {
  ERROR_UNKNOWN_PROVIDER: errors.ERROR_UNKNOWN_PROVIDER,
  ERROR_ACCOUNT_NOT_FOUND: errors.ERROR_ACCOUNT_NOT_FOUND,
  DEFAULT_CODEX_ID_PREFIX: storage.DEFAULT_CODEX_ID_PREFIX,
  IDENTIFIER_RADIX: limits.IDENTIFIER_RADIX,
  PROVIDER_CODEX: providers.PROVIDER_CODEX,
  DEFAULT_ACCOUNT_LABEL: text.DEFAULT_ACCOUNT_LABEL
};
