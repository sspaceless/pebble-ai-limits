var C = require('../resources/providers/custom');
var http = require('../network/http').request;
var response = require('./response');

var customUsage = require('./parsers/custom');

function usage(config, done) {
  var headers = { Accept: C.CONTENT_TYPE_JSON };

  if (config.accessToken) {
    headers.Authorization = C.BEARER_PREFIX + config.accessToken;
  }

  http(C.HTTP_GET, config.url, null, headers, response(customUsage, config, done));
}

module.exports = { usage: usage, normalize: customUsage };
