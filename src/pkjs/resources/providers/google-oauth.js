/** Explicit constant dependencies; these alone accompany the browser factory. */
var endpoints = require('../shared/endpoints');
var syntax = require('../shared/syntax');
var http = require('../shared/http');

module.exports = {
  GOOGLE_CLIENT_ID: endpoints.GOOGLE_CLIENT_ID,
  GOOGLE_INSTALLED_APP_SECRET: endpoints.GOOGLE_INSTALLED_APP_SECRET,
  REFRESH_TOKEN_GRANT: endpoints.REFRESH_TOKEN_GRANT,
  EQUALS: syntax.EQUALS,
  AMPERSAND: syntax.AMPERSAND,
  GOOGLE_TOKEN_URL: endpoints.GOOGLE_TOKEN_URL,
  CONTENT_TYPE_FORM: http.CONTENT_TYPE_FORM
};
