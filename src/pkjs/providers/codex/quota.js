var C = require('../../resources/providers/codex/quota');
var plans = require('../../plans');

function normalizeUsage(payload) {
  if (!payload || !Object.prototype.hasOwnProperty.call(payload, C.CODEX_RATE_LIMIT_FIELD)) {
    throw new Error(C.ERROR_INVALID_USAGE_RESPONSE);
  }

  var limits = payload.rate_limit || {};

  function quota(w) {
    if (!w) {
      return { left: C.QUOTA_UNAVAILABLE, resetsAt: 0, windowMins: 0 };
    }

    return {
      left:
        typeof w.used_percent === 'number' && isFinite(w.used_percent)
          ? Math.round(Math.max(0, Math.min(C.PERCENT_MAX, C.PERCENT_MAX - w.used_percent)))
          : C.QUOTA_UNAVAILABLE,
      resetsAt:
        typeof w.reset_at === 'number' && isFinite(w.reset_at) && w.reset_at > 0
          ? Math.floor(w.reset_at)
          : 0,
      windowMins:
        typeof w.limit_window_seconds === 'number'
          ? w.limit_window_seconds / C.SECONDS_PER_MINUTE
          : 0
    };
  }

  return {
    primary: quota(limits.primary_window),
    secondary: quota(limits.secondary_window),
    updatedAt: Math.floor(Date.now() / C.MILLISECONDS_PER_SECOND),
    plan: plans.label(payload.plan_type)
  };
}

module.exports = normalizeUsage;
