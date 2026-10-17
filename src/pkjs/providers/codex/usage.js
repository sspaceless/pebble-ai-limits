var C = require('../../resources/providers/codex/usage');
var http = require('../../network/http').request;
var plans = require('../../plans');
var normalizeUsage = require('./quota');

var USAGE = C.CODEX_USAGE_URL;

function usage(config, done) {
  http(
    C.HTTP_GET,
    USAGE,
    null,
    {
      Authorization: C.BEARER_PREFIX + config.accessToken,
      'ChatGPT-Account-Id': config.accountId,
      Accept: C.CONTENT_TYPE_JSON
    },
    function (error, data) {
      if (error) {
        return done(error);
      }

      var normalized;

      try {
        normalized = normalizeUsage(data);
      } catch (_) {
        return done({ invalidData: true });
      }

      if (!normalized.plan) {
        normalized.plan = plans.label(config.plan);
      }

      done(null, normalized);
    }
  );
}

module.exports = usage;
