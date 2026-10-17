/** Explicit constant dependencies; these alone accompany the browser factory. */
var errors = require('../../shared/errors');
var text = require('../../shared/text');

module.exports = {
  ERROR_INVALID_LIMITS: errors.ERROR_INVALID_LIMITS,
  ERROR_MODEL_LIMITS_UNAVAILABLE: errors.ERROR_MODEL_LIMITS_UNAVAILABLE,
  REQUESTS_PER_MINUTE_LABEL: text.REQUESTS_PER_MINUTE_LABEL,
  INPUT_TOKENS_PER_MINUTE_LABEL: text.INPUT_TOKENS_PER_MINUTE_LABEL,
  CONFIGURED_CAPS_STATUS: text.CONFIGURED_CAPS_STATUS
};
