/** Explicit constant dependencies; these alone accompany the browser factory. */
var endpoints = require('../../shared/endpoints');
var limits = require('../../shared/limits');
var http = require('../../shared/http');
var syntax = require('../../shared/syntax');

module.exports = {
  AUTH_ORIGIN: endpoints.AUTH_ORIGIN,
  CODEX_CLIENT_ID: endpoints.CODEX_CLIENT_ID,
  DEVICE_CODE_PATH: endpoints.DEVICE_CODE_PATH,
  MAX_POLL_INTERVAL_SECONDS: limits.MAX_POLL_INTERVAL_SECONDS,
  MIN_POLL_INTERVAL_SECONDS: limits.MIN_POLL_INTERVAL_SECONDS,
  DEVICE_CODE_TTL_MINUTES: limits.DEVICE_CODE_TTL_MINUTES,
  SECONDS_PER_MINUTE: limits.SECONDS_PER_MINUTE,
  MILLISECONDS_PER_SECOND: limits.MILLISECONDS_PER_SECOND,
  LOGIN_REQUEST_GROUP: http.LOGIN_REQUEST_GROUP,
  DEVICE_TOKEN_PATH: endpoints.DEVICE_TOKEN_PATH,
  HTTP_FORBIDDEN: http.HTTP_FORBIDDEN,
  HTTP_NOT_FOUND: http.HTTP_NOT_FOUND,
  AUTHORIZATION_CODE_GRANT: endpoints.AUTHORIZATION_CODE_GRANT,
  DEVICE_CALLBACK_PATH: endpoints.DEVICE_CALLBACK_PATH,
  EQUALS: syntax.EQUALS,
  AMPERSAND: syntax.AMPERSAND,
  HTTP_POST: http.HTTP_POST,
  TOKEN_PATH: endpoints.TOKEN_PATH,
  CONTENT_TYPE_FORM: http.CONTENT_TYPE_FORM
};
