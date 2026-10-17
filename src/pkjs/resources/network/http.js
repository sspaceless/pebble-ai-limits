/** Explicit constant dependencies; these alone accompany the browser factory. */
var limits = require('../shared/limits');
var http = require('../shared/http');

module.exports = {
  REQUEST_TIMEOUT_MS: limits.REQUEST_TIMEOUT_MS,
  USAGE_REQUEST_GROUP: http.USAGE_REQUEST_GROUP,
  HTTP_OK: http.HTTP_OK,
  HTTP_REDIRECT_START: http.HTTP_REDIRECT_START,
  SUBSCRIPTION_REQUIRED_REASON: http.SUBSCRIPTION_REQUIRED_REASON
};
