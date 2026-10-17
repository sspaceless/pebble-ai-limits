var C = require('../resources/companion/error-status');
var providers = require('../providers');

/**
 * Translate a sanitized request error to watch-safe status text.
 * @param {Object} error Transport/provider error with status, reason, or invalidData fields.
 * @param {string} provider Known catalog ID, used to distinguish API credentials.
 * @param {boolean} auth Whether the error came from authentication/token renewal.
 * @returns {string} Short display status without provider response bodies or credentials.
 */
function errorStatus(error, provider, auth) {
  if (error.reason === C.SUBSCRIPTION_REQUIRED_REASON) {
    return C.SUBSCRIPTION_REQUIRED;
  }

  if (error.invalidData) {
    return C.INVALID_API_DATA;
  }

  if (error.status === C.HTTP_UNAUTHORIZED || (auth && error.status === C.HTTP_BAD_REQUEST)) {
    return providers.info(provider).kind === C.KIND_API ? C.CHECK_API_CREDENTIALS : C.SIGN_IN_AGAIN;
  }

  if (error.status === C.HTTP_FORBIDDEN) {
    return C.API_ACCESS_DENIED;
  }

  if (error.status === C.HTTP_RATE_LIMITED) {
    return C.TRY_AGAIN_LATER;
  }

  return C.API_UNAVAILABLE;
}

module.exports = errorStatus;
