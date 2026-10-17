var C = require('../../resources/providers/parsers/gemini');
var quota = require('../quota');

var number = quota.number;
var timestamp = quota.timestamp;
var unknown = quota.unknown;
var snapshot = quota.snapshot;

/** Normalize provider metadata without network or storage side effects. */
function geminiUsage(payload, config) {
  if (!Array.isArray(payload.buckets)) {
    throw new Error(C.ERROR_INVALID_QUOTAS);
  }

  function bucket(model) {
    var candidates = payload.buckets.filter(function (b) {
      return b.modelId === model;
    });

    if (!candidates.length) {
      return unknown(model);
    }

    var known = candidates.filter(function (b) {
      return number(b.remainingFraction);
    });

    if (!known.length) {
      return unknown(model);
    }

    var restrictiveBucket = known.reduce(function (a, b) {
      return a.remainingFraction < b.remainingFraction ? a : b;
    });

    return {
      left: Math.round(
        Math.max(0, Math.min(C.PERCENT_MAX, restrictiveBucket.remainingFraction * C.PERCENT_MAX))
      ),
      resetsAt: timestamp(restrictiveBucket.resetTime),
      value: '',
      windowKey: model,
      windowMins: 0,
      note: model
        .replace(new RegExp(C.GEMINI_MODEL_PREFIX_PATTERN), '')
        .slice(0, C.MODEL_NOTE_MAX_LENGTH)
    };
  }

  var models = payload.buckets
    .map(function (b) {
      return b.modelId;
    })
    .filter(function (m, i, a) {
      return m && a.indexOf(m) === i;
    })
    .sort();
  var first = config.model || models[0];
  var second =
    config.secondaryModel ||
    models.filter(function (m) {
      return m !== first;
    })[0];

  return snapshot(bucket(first), bucket(second), null, null, config.plan);
}

module.exports = geminiUsage;
