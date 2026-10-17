var C = require('../../resources/providers/parsers/claude-api');
var quota = require('../quota');

var snapshot = quota.snapshot;
var cap = quota.cap;

/** Normalize provider metadata without network or storage side effects. */
function claudeCaps(payload, config) {
  if (!Array.isArray(payload.data)) {
    throw new Error(C.ERROR_INVALID_LIMITS);
  }

  var groups = payload.data.filter(function (g) {
    return Array.isArray(g.models) && g.models.indexOf(config.model) >= 0;
  });

  if (groups.length !== 1) {
    throw new Error(C.ERROR_MODEL_LIMITS_UNAVAILABLE);
  }

  var values = {};

  (groups[0].limits || []).forEach(function (v) {
    values[v.type] = v.value;
  });

  return snapshot(
    cap(values.requests_per_minute, C.REQUESTS_PER_MINUTE_LABEL),
    cap(values.input_tokens_per_minute, C.INPUT_TOKENS_PER_MINUTE_LABEL),
    null,
    C.CONFIGURED_CAPS_STATUS
  );
}

module.exports = claudeCaps;
