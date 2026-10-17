/** Explicit constant dependencies; these alone accompany the browser factory. */
var endpoints = require('../../shared/endpoints');
var http = require('../../shared/http');

module.exports = {
  CODEX_USAGE_URL: endpoints.CODEX_USAGE_URL,
  HTTP_GET: http.HTTP_GET,
  BEARER_PREFIX: http.BEARER_PREFIX,
  CONTENT_TYPE_JSON: http.CONTENT_TYPE_JSON
};
