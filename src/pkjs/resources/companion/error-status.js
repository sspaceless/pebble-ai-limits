/** Explicit constant dependencies; these alone accompany the browser factory. */
var http = require('../shared/http');
var text = require('../shared/text');
var providers = require('../shared/providers');

module.exports = {
  SUBSCRIPTION_REQUIRED_REASON: http.SUBSCRIPTION_REQUIRED_REASON,
  SUBSCRIPTION_REQUIRED: text.SUBSCRIPTION_REQUIRED,
  INVALID_API_DATA: text.INVALID_API_DATA,
  HTTP_UNAUTHORIZED: http.HTTP_UNAUTHORIZED,
  HTTP_BAD_REQUEST: http.HTTP_BAD_REQUEST,
  KIND_API: providers.KIND_API,
  CHECK_API_CREDENTIALS: text.CHECK_API_CREDENTIALS,
  SIGN_IN_AGAIN: text.SIGN_IN_AGAIN,
  HTTP_FORBIDDEN: http.HTTP_FORBIDDEN,
  API_ACCESS_DENIED: text.API_ACCESS_DENIED,
  HTTP_RATE_LIMITED: http.HTTP_RATE_LIMITED,
  TRY_AGAIN_LATER: text.TRY_AGAIN_LATER,
  API_UNAVAILABLE: text.API_UNAVAILABLE
};
