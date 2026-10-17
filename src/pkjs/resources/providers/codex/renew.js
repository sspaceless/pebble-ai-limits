/** Explicit constant dependencies; these alone accompany the browser factory. */
var endpoints = require('../../shared/endpoints');
var http = require('../../shared/http');

module.exports = {
  CODEX_CLIENT_ID: endpoints.CODEX_CLIENT_ID,
  HTTP_UNAUTHORIZED: http.HTTP_UNAUTHORIZED,
  TOKEN_PATH: endpoints.TOKEN_PATH,
  REFRESH_TOKEN_GRANT: endpoints.REFRESH_TOKEN_GRANT
};
