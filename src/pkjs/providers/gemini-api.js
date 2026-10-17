var C = require('../resources/providers/gemini-api');
var http = require('../network/http').request;
var response = require('./response');
var geminiCaps = require('./parsers/gemini-api');

var MAX_PAGES = C.MAX_PAGES;
var MAX_ACCUMULATED_METRICS = C.MAX_ACCUMULATED_METRICS;

function usage(config, done) {
  var url = C.GOOGLE_PROJECT_URL_PREFIX + config.project + C.GOOGLE_QUOTA_URL_SUFFIX;
  var headers = {
    Accept: C.CONTENT_TYPE_JSON,
    Authorization: C.BEARER_PREFIX + config.accessToken
  };
  var pageCount = 0;
  var finish = response(geminiCaps, config, done);

  function fetchPage(pageUrl, acc) {
    if (++pageCount > MAX_PAGES) {
      return done({ invalidData: true });
    }

    http(C.HTTP_GET, pageUrl, null, headers, function (error, payload) {
      if (error) {
        return done(error);
      }

      if (!Array.isArray(payload.metrics)) {
        return done({ invalidData: true });
      }

      var combinedMetrics = acc.concat(payload.metrics);

      if (payload.nextPageToken) {
        if (combinedMetrics.length > MAX_ACCUMULATED_METRICS) {
          return done({ invalidData: true });
        }

        return fetchPage(
          url + C.PAGE_TOKEN_QUERY_PREFIX + encodeURIComponent(payload.nextPageToken),
          combinedMetrics
        );
      }

      finish(null, { metrics: combinedMetrics });
    });
  }

  fetchPage(url, []);
}

module.exports = { usage: usage, renew: require('./google-oauth').renew, normalize: geminiCaps };
