/** Explicit constant dependencies; these alone accompany the browser factory. */
var endpoints = require('../shared/endpoints');
var http = require('../shared/http');

module.exports = {
  CLAUDE_CLIENT_ID: endpoints.CLAUDE_CLIENT_ID,
  HTTP_GET: http.HTTP_GET,
  CLAUDE_USAGE_URL: endpoints.CLAUDE_USAGE_URL,
  CONTENT_TYPE_JSON: http.CONTENT_TYPE_JSON,
  BEARER_PREFIX: http.BEARER_PREFIX,
  CLAUDE_OAUTH_BETA_VERSION: http.CLAUDE_OAUTH_BETA_VERSION,
  CLAUDE_TOKEN_URL: endpoints.CLAUDE_TOKEN_URL,
  REFRESH_TOKEN_GRANT: endpoints.REFRESH_TOKEN_GRANT
};
