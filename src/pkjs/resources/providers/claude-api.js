/** Explicit constant dependencies; these alone accompany the browser factory. */
var http = require('../shared/http');
var endpoints = require('../shared/endpoints');

module.exports = {
  HTTP_GET: http.HTTP_GET,
  CLAUDE_RATE_LIMITS_URL_PREFIX: endpoints.CLAUDE_RATE_LIMITS_URL_PREFIX,
  CONTENT_TYPE_JSON: http.CONTENT_TYPE_JSON,
  ANTHROPIC_API_VERSION: http.ANTHROPIC_API_VERSION
};
