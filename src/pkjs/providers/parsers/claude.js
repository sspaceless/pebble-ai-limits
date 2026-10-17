var C = require('../../resources/providers/parsers/claude');
var quota = require('../quota');

var snapshot = quota.snapshot;
var windowQuota = quota.windowQuota;

/** Normalize provider metadata without network or storage side effects. */
function claudeUsage(payload) {
  var limits = payload.rate_limits || payload;

  if (
    !Object.prototype.hasOwnProperty.call(limits, C.CLAUDE_SESSION_FIELD) &&
    !Object.prototype.hasOwnProperty.call(limits, C.CLAUDE_WEEK_FIELD)
  ) {
    throw new Error(C.ERROR_INVALID_USAGE);
  }

  return snapshot(
    windowQuota(limits.five_hour, '', C.CLAUDE_SESSION_WINDOW_MINUTES),
    windowQuota(limits.seven_day, '', C.CLAUDE_WEEK_WINDOW_MINUTES),
    null,
    null,
    payload.subscription_type || payload.plan_type
  );
}

module.exports = claudeUsage;
