var C = require('../../resources/providers/parsers/custom');
var quota = require('../quota');

var number = quota.number;
var timestamp = quota.timestamp;
var snapshot = quota.snapshot;

/** Normalize provider metadata without network or storage side effects. */
function customUsage(payload) {
  function row(r) {
    if (!r || !number(r.left) || r.left < C.QUOTA_UNAVAILABLE || r.left > C.PERCENT_MAX) {
      throw new Error(C.ERROR_INVALID_QUOTA);
    }

    return {
      left: Math.round(r.left),
      resetsAt: timestamp(r.resetsAt),
      value: '',
      windowMins: number(r.windowMins) ? r.windowMins : 0,
      windowKey: typeof r.windowKey === 'string' ? r.windowKey : '',
      note: String(r.note || '').slice(0, C.QUOTA_NOTE_MAX_LENGTH)
    };
  }

  if (
    !number(payload.updatedAt) ||
    payload.updatedAt <= 0 ||
    payload.updatedAt > Date.now() / C.MILLISECONDS_PER_SECOND + C.MAX_SNAPSHOT_CLOCK_SKEW_SECONDS
  ) {
    throw new Error(C.ERROR_INVALID_TIMESTAMP);
  }

  return snapshot(
    row(payload.primary),
    row(payload.secondary),
    Math.floor(payload.updatedAt),
    null,
    payload.plan
  );
}

module.exports = customUsage;
