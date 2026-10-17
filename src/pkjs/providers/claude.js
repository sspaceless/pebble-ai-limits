var C = require('../resources/providers/claude');
var http = require('../network/http').request;
var response = require('./response');
var exchange = require('./oauth').exchange;
var claudeUsage = require('./parsers/claude');

var CLIENT_ID = C.CLAUDE_CLIENT_ID;

function usage(config, done) {
  http(
    C.HTTP_GET,
    C.CLAUDE_USAGE_URL,
    null,
    {
      Accept: C.CONTENT_TYPE_JSON,
      Authorization: C.BEARER_PREFIX + config.accessToken,
      'anthropic-beta': C.CLAUDE_OAUTH_BETA_VERSION
    },
    response(claudeUsage, config, done)
  );
}

function renew(config, done) {
  exchange(
    C.CLAUDE_TOKEN_URL,
    JSON.stringify({
      grant_type: C.REFRESH_TOKEN_GRANT,
      refresh_token: config.refreshToken,
      client_id: config.clientId || CLIENT_ID
    }),
    { 'Content-Type': C.CONTENT_TYPE_JSON },
    config,
    done
  );
}

module.exports = { usage: usage, renew: renew, normalize: claudeUsage };
