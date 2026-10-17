/** Explicit constant dependencies; these alone accompany the browser factory. */
var providers = require('./shared/providers');
var http = require('./shared/http');

module.exports = {
  PROVIDER_CODEX: providers.PROVIDER_CODEX,
  HTTP_UNAUTHORIZED: http.HTTP_UNAUTHORIZED,
  PROVIDER_CLAUDE_API: providers.PROVIDER_CLAUDE_API,
  PROVIDER_GEMINI_API: providers.PROVIDER_GEMINI_API
};
