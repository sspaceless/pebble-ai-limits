/** Explicit constant dependencies; these alone accompany the browser factory. */
var storage = require('../shared/storage');
var providers = require('../shared/providers');
var http = require('../shared/http');
var text = require('../shared/text');
var limits = require('../shared/limits');

module.exports = {
  PENDING_LOGIN_KEY: storage.PENDING_LOGIN_KEY,
  PROVIDER_CODEX: providers.PROVIDER_CODEX,
  LOGIN_REQUEST_GROUP: http.LOGIN_REQUEST_GROUP,
  STARTING_LOGIN: text.STARTING_LOGIN,
  APPROVE_LOGIN_ON_PHONE: text.APPROVE_LOGIN_ON_PHONE,
  LOGIN_CODE_EXPIRED: text.LOGIN_CODE_EXPIRED,
  WAITING_FOR_APPROVAL: text.WAITING_FOR_APPROVAL,
  MILLISECONDS_PER_SECOND: limits.MILLISECONDS_PER_SECOND,
  HTTP_BAD_REQUEST: http.HTTP_BAD_REQUEST,
  HTTP_SERVER_ERROR: http.HTTP_SERVER_ERROR,
  HTTP_RATE_LIMITED: http.HTTP_RATE_LIMITED
};
