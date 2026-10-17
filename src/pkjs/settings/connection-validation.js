var C = require('../resources/settings/connection-validation');

/**
 * Check required connection fields before staging a WebView draft.
 * This is a form-level check; provider credential import performs deeper validation.
 * @param {string} provider Provider catalog ID.
 * @param {Object} data Trimmed credential and connection fields.
 * @returns {string} User-facing validation error, or an empty string when valid.
 */
module.exports = function (provider, data) {
  if (provider !== C.PROVIDER_CUSTOM && !data.credentials) {
    return C.ENTER_THE_CREDENTIALS_TO_CONTINUE;
  }

  if (provider === C.PROVIDER_CUSTOM && (!data.url || data.url.indexOf(C.HTTPS_SCHEME) !== 0)) {
    return C.ENTER_AN_HTTPS_ENDPOINT;
  }

  if (provider === C.PROVIDER_CLAUDE_API && !data.model) {
    return C.ENTER_A_MODEL_ID;
  }

  if (provider === C.PROVIDER_GEMINI_API && (!data.model || !data.project || !data.quotaMetric)) {
    return C.COMPLETE_THE_MODEL_PROJECT_AND_QUOTA_METRIC;
  }

  return '';
};

module.exports.constants = C;
