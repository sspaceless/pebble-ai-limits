/** Explicit constant dependencies; these alone accompany the browser factory. */
var quota = require('../../shared/quota');
var errors = require('../../shared/errors');
var limits = require('../../shared/limits');

module.exports = {
  CODEX_RATE_LIMIT_FIELD: quota.CODEX_RATE_LIMIT_FIELD,
  ERROR_INVALID_USAGE_RESPONSE: errors.ERROR_INVALID_USAGE_RESPONSE,
  QUOTA_UNAVAILABLE: limits.QUOTA_UNAVAILABLE,
  PERCENT_MAX: limits.PERCENT_MAX,
  SECONDS_PER_MINUTE: limits.SECONDS_PER_MINUTE,
  MILLISECONDS_PER_SECOND: limits.MILLISECONDS_PER_SECOND
};
