var C = require('../../resources/providers/parsers/gemini-api');
var quota = require('../quota');

var snapshot = quota.snapshot;
var cap = quota.cap;

/** Normalize provider metadata without network or storage side effects. */
function geminiCaps(payload, config) {
  if (!Array.isArray(payload.metrics)) {
    throw new Error(C.ERROR_INVALID_METRICS);
  }

  var metric = payload.metrics.filter(function (m) {
    return m.metric === config.quotaMetric;
  });

  if (
    metric.length !== 1 ||
    !new RegExp(C.REQUEST_METRIC_PATTERN, C.REGEX_IGNORE_CASE).test(metric[0].metric)
  ) {
    throw new Error(C.ERROR_REQUEST_QUOTA_METRIC_UNAVAILABLE);
  }

  var rows = {};

  (metric[0].consumerQuotaLimits || []).forEach(function (limit) {
    var unit = limit.unit || '';

    if (!new RegExp(C.REQUEST_QUOTA_UNIT_PATTERN).test(unit)) {
      return;
    }

    if (unit.indexOf(C.QUOTA_USER_DIMENSION) >= 0) {
      return;
    }

    var period =
      unit.indexOf(C.QUOTA_MINUTE_UNIT) >= 0
        ? C.QUOTA_PERIOD_MINUTE
        : unit.indexOf(C.QUOTA_DAY_UNIT) >= 0
          ? C.QUOTA_PERIOD_DAY
          : null;

    if (!period) {
      return;
    }

    var buckets = (limit.quotaBuckets || []).filter(function (b) {
      var d = b.dimensions || {};

      return (
        (d.model === config.model || !d.model) &&
        Object.keys(d).every(function (k) {
          return k === C.MODEL_DIMENSION || (k === C.REGION_DIMENSION && d[k] === C.GLOBAL_REGION);
        })
      );
    });
    var exact = buckets.filter(function (b) {
      return (b.dimensions || {}).model === config.model;
    });

    if (exact.length) {
      buckets = exact;
    }

    if (buckets.length !== 1 || rows[period]) {
      throw new Error(C.ERROR_AMBIGUOUS_QUOTA_DIMENSIONS);
    }

    var value = buckets[0].effectiveLimit;

    rows[period] = new RegExp(C.QUOTA_CAP_PATTERN).test(String(value)) ? Number(value) : NaN;
  });

  if (!Object.keys(rows).length) {
    throw new Error(C.ERROR_NO_MATCHING_QUOTAS);
  }

  return snapshot(
    cap(rows.minute, C.REQUESTS_PER_MINUTE_LABEL),
    cap(rows.day, C.REQUESTS_PER_DAY_LABEL),
    null,
    C.CONFIGURED_CAPS_STATUS
  );
}

module.exports = geminiCaps;
