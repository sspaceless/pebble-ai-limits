var C = require('../resources/providers/gemini');
var http = require('../network/http').request;
var plans = require('../plans');
var response = require('./response');

var geminiUsage = require('./parsers/gemini');

function usage(config, done) {
  if (!config.project) {
    return http(
      C.HTTP_POST,
      C.GEMINI_DISCOVERY_URL,
      JSON.stringify({
        mode: C.DISCOVERY_HEALTH_CHECK_MODE,
        metadata: {
          ideType: C.DISCOVERY_IDE,
          platform: C.DISCOVERY_PLATFORM,
          pluginType: C.DISCOVERY_PLUGIN
        }
      }),
      { Authorization: C.BEARER_PREFIX + config.accessToken, 'Content-Type': C.CONTENT_TYPE_JSON },
      function (error, payload) {
        if (error) {
          return done(error);
        }

        var project =
          typeof payload.cloudaicompanionProject === 'string'
            ? payload.cloudaicompanionProject
            : (payload.cloudaicompanionProject || {}).id;

        if (
          typeof project !== 'string' ||
          !new RegExp(C.CODE_ASSIST_PROJECT_PATTERN).test(project)
        ) {
          return done({ invalidData: true });
        }

        config.project = project;
        config.plan = plans.label((payload.paidTier || payload.currentTier || {}).name);
        usage(config, done);
      }
    );
  }

  http(
    C.HTTP_POST,
    C.GEMINI_QUOTA_URL,
    JSON.stringify({ project: config.project }),
    {
      Accept: C.CONTENT_TYPE_JSON,
      Authorization: C.BEARER_PREFIX + config.accessToken,
      'Content-Type': C.CONTENT_TYPE_JSON
    },
    response(geminiUsage, config, done)
  );
}

module.exports = { usage: usage, renew: require('./google-oauth').renew, normalize: geminiUsage };
