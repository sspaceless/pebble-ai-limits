/** Explicit constant dependencies; these alone accompany the browser factory. */
var limits = require('../../shared/limits');
var errors = require('../../shared/errors');

module.exports = {
  QUOTA_UNAVAILABLE: limits.QUOTA_UNAVAILABLE,
  PERCENT_MAX: limits.PERCENT_MAX,
  ERROR_INVALID_QUOTA: errors.ERROR_INVALID_QUOTA,
  QUOTA_NOTE_MAX_LENGTH: limits.QUOTA_NOTE_MAX_LENGTH,
  MILLISECONDS_PER_SECOND: limits.MILLISECONDS_PER_SECOND,
  MAX_SNAPSHOT_CLOCK_SKEW_SECONDS: limits.MAX_SNAPSHOT_CLOCK_SKEW_SECONDS,
  ERROR_INVALID_TIMESTAMP: errors.ERROR_INVALID_TIMESTAMP
};
