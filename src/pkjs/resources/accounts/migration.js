/** Explicit constant dependencies; these alone accompany the browser factory. */
var limits = require('../shared/limits');
var storage = require('../shared/storage');
var providers = require('../shared/providers');
var http = require('../shared/http');
var text = require('../shared/text');

module.exports = {
  PROFILE_SCHEMA_VERSION: limits.PROFILE_SCHEMA_VERSION,
  LEGACY_SELECTION_KEY: storage.LEGACY_SELECTION_KEY,
  PROVIDER_CODEX: providers.PROVIDER_CODEX,
  LEGACY_CODEX_KEY: storage.LEGACY_CODEX_KEY,
  LEGACY_PROVIDER_KEY_PREFIX: storage.LEGACY_PROVIDER_KEY_PREFIX,
  LEGACY_PROVIDER_KEY_SUFFIX: storage.LEGACY_PROVIDER_KEY_SUFFIX,
  CONNECTION_MODE_DIRECT: http.CONNECTION_MODE_DIRECT,
  DEFAULT_ACCOUNT_ID_SUFFIX: storage.DEFAULT_ACCOUNT_ID_SUFFIX,
  DEFAULT_ACCOUNT_LABEL: text.DEFAULT_ACCOUNT_LABEL,
  DEFAULT_CODEX_ID: storage.DEFAULT_CODEX_ID
};
