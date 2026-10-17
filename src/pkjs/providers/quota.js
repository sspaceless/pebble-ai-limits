var C = require('../resources/providers/quota');
var plans = require('../plans');

/**
 * @typedef {Object} Quota
 * @property {number} left Remaining percentage, or the unavailable sentinel for caps/missing usage.
 * @property {number} resetsAt Unix seconds; zero means unknown or not applicable.
 * @property {string} value Absolute display value; empty for percentage quotas.
 * @property {string} note Display annotation, such as units or model name.
 * @property {number} [windowMins] Quota-window duration in minutes; zero means unknown.
 * @property {string} [windowKey] Stable provider window/model identity when available.
 */

/**
 * @typedef {Object} QuotaSnapshot
 * @property {Quota} primary First displayed quota.
 * @property {Quota} secondary Second displayed quota.
 * @property {number} updatedAt Snapshot timestamp in Unix seconds.
 * @property {string} status Optional display status, represented by an empty string when absent.
 * @property {string} plan Normalized explicit plan label, or an empty string.
 */

/**
 * Test for a finite number without coercing strings, null, or booleans.
 * @param {*} value Candidate numeric value.
 * @returns {boolean} Whether the value has number type and is finite.
 */
function number(value) {
  return typeof value === 'number' && isFinite(value);
}

/**
 * Convert numeric Unix seconds or a parseable date to whole Unix seconds.
 * @param {*} value Numeric seconds or a value accepted by Date.parse().
 * @returns {number} Positive whole Unix seconds, or zero for unknown/invalid timestamps.
 */
function timestamp(value) {
  if (number(value)) {
    return value > 0 ? Math.floor(value) : 0;
  }

  var n = Date.parse(value);

  return isFinite(n) && n > 0 ? Math.floor(n / C.MILLISECONDS_PER_SECOND) : 0;
}

/**
 * Create an unavailable quota without inventing a percentage or reset time.
 * @param {string} [note] Optional display annotation.
 * @returns {Quota} A fresh quota with the unavailable sentinel and unknown reset.
 */
function unknown(note) {
  return { left: C.QUOTA_UNAVAILABLE, resetsAt: 0, value: '', note: note || '' };
}

/**
 * Convert a provider usage window to a remaining-percentage quota.
 * Missing usage stays unavailable; finite usage is clamped to the percentage range.
 * @param {?Object} value Window with utilization/used_percentage and resets_at metadata.
 * @param {string} [note] Optional display annotation.
 * @param {number} [duration] Window duration in minutes; zero or omitted means unknown.
 * @returns {Quota} Normalized quota; absent windows produce an unavailable quota.
 */
function windowQuota(value, note, duration) {
  if (!value) {
    return unknown(note);
  }

  var used = value.utilization;

  if (!number(used)) {
    used = value.used_percentage;
  }

  return {
    left: number(used)
      ? Math.round(Math.max(0, Math.min(C.PERCENT_MAX, C.PERCENT_MAX - used)))
      : C.QUOTA_UNAVAILABLE,
    resetsAt: timestamp(value.resets_at),
    note: note || '',
    value: '',
    windowMins: duration || 0
  };
}

/**
 * Assemble the common snapshot shape and normalize optional plan metadata.
 * Quota objects are retained by reference, without cloning or mutating them.
 * @param {Quota} primary Primary quota.
 * @param {Quota} secondary Secondary quota.
 * @param {?number} [updated] Unix seconds; a falsy value uses the current time.
 * @param {?string} [status] Display status; omitted/falsy values become an empty string.
 * @param {*} [plan] Explicit provider plan metadata.
 * @returns {QuotaSnapshot} A new snapshot containing the supplied quotas.
 */
function snapshot(primary, secondary, updated, status, plan) {
  return {
    primary: primary,
    secondary: secondary,
    updatedAt: updated || Math.floor(Date.now() / C.MILLISECONDS_PER_SECOND),
    status: status || '',
    plan: plans.label(plan)
  };
}

/**
 * Format an absolute cap using K/M suffixes and one decimal of precision.
 * @param {*} n Numeric cap; the unlimited sentinel has its own display label.
 * @returns {string} Compact value, unlimited label, or unavailable label for invalid caps.
 */
function compact(n) {
  if (n === C.UNLIMITED_CAP) {
    return C.UNLIMITED_DISPLAY;
  }

  if (!number(n) || n < 0) {
    return C.UNAVAILABLE_DISPLAY;
  }

  if (n >= C.COMPACT_MILLION) {
    return String(Math.round(n / C.MILLION_ROUNDING_SCALE) / C.DECIMAL_SCALE) + C.MILLION_SUFFIX;
  }

  if (n >= C.COMPACT_THOUSAND) {
    return String(Math.round(n / C.THOUSAND_ROUNDING_SCALE) / C.DECIMAL_SCALE) + C.THOUSAND_SUFFIX;
  }

  return String(n);
}

/**
 * Build an absolute-cap quota that cannot be mistaken for remaining usage.
 * @param {*} value Configured numeric cap, unlimited sentinel, or an unavailable value.
 * @param {string} note Unit and cap annotation shown below the value.
 * @returns {Quota} Quota with a compact absolute value and no percentage/reset.
 */
function cap(value, note) {
  return { left: C.QUOTA_UNAVAILABLE, resetsAt: 0, value: compact(value), note: note };
}

/** Shared quota shapes; missing values stay unavailable rather than becoming zero. */
module.exports = {
  number: number,
  timestamp: timestamp,
  unknown: unknown,
  windowQuota: windowQuota,
  snapshot: snapshot,
  cap: cap
};
