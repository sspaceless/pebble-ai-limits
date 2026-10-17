/** Explicit constant dependencies; these alone accompany the browser factory. */
var endpoints = require('../../shared/endpoints');
var http = require('../../shared/http');

module.exports = {
  AUTH_ORIGIN: endpoints.AUTH_ORIGIN,
  HTTP_POST: http.HTTP_POST,
  CONTENT_TYPE_JSON: http.CONTENT_TYPE_JSON
};
