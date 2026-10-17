var C = require('../resources/providers/claude-api');
var http = require('../network/http').request;
var response = require('./response');

var claudeCaps = require('./parsers/claude-api');

function usage(config, done) {
  http(
    C.HTTP_GET,
    C.CLAUDE_RATE_LIMITS_URL_PREFIX + encodeURIComponent(config.model),
    null,
    {
      Accept: C.CONTENT_TYPE_JSON,
      'x-api-key': config.apiKey,
      'anthropic-version': C.ANTHROPIC_API_VERSION
    },
    response(claudeCaps, config, done)
  );
}

module.exports = { usage: usage, normalize: claudeCaps };
