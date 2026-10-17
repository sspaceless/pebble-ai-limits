/** Explicit constant dependencies; these alone accompany the browser factory. */
var limits = require('../shared/limits');
var endpoints = require('../shared/endpoints');
var http = require('../shared/http');

module.exports = {
  MAX_PAGES: limits.MAX_PAGES,
  MAX_ACCUMULATED_METRICS: limits.MAX_ACCUMULATED_METRICS,
  GOOGLE_PROJECT_URL_PREFIX: endpoints.GOOGLE_PROJECT_URL_PREFIX,
  GOOGLE_QUOTA_URL_SUFFIX: endpoints.GOOGLE_QUOTA_URL_SUFFIX,
  CONTENT_TYPE_JSON: http.CONTENT_TYPE_JSON,
  BEARER_PREFIX: http.BEARER_PREFIX,
  HTTP_GET: http.HTTP_GET,
  PAGE_TOKEN_QUERY_PREFIX: endpoints.PAGE_TOKEN_QUERY_PREFIX
};
