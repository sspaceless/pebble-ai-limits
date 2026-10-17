/** Explicit constant dependencies; these alone accompany the browser factory. */
var providers = require('../shared/providers');
var text = require('../shared/text');
var http = require('../shared/http');

module.exports = {
  PROVIDER_CUSTOM: providers.PROVIDER_CUSTOM,
  ENTER_THE_CREDENTIALS_TO_CONTINUE: text.ENTER_THE_CREDENTIALS_TO_CONTINUE,
  HTTPS_SCHEME: http.HTTPS_SCHEME,
  ENTER_AN_HTTPS_ENDPOINT: text.ENTER_AN_HTTPS_ENDPOINT,
  PROVIDER_CLAUDE_API: providers.PROVIDER_CLAUDE_API,
  ENTER_A_MODEL_ID: text.ENTER_A_MODEL_ID,
  PROVIDER_GEMINI_API: providers.PROVIDER_GEMINI_API,
  COMPLETE_THE_MODEL_PROJECT_AND_QUOTA_METRIC: text.COMPLETE_THE_MODEL_PROJECT_AND_QUOTA_METRIC
};
