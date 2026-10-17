/** Explicit constant dependencies; these alone accompany the browser factory. */
var http = require('../shared/http');
var endpoints = require('../shared/endpoints');
var quota = require('../shared/quota');
var patterns = require('../shared/patterns');

module.exports = {
  HTTP_POST: http.HTTP_POST,
  GEMINI_DISCOVERY_URL: endpoints.GEMINI_DISCOVERY_URL,
  DISCOVERY_HEALTH_CHECK_MODE: quota.DISCOVERY_HEALTH_CHECK_MODE,
  DISCOVERY_IDE: quota.DISCOVERY_IDE,
  DISCOVERY_PLATFORM: quota.DISCOVERY_PLATFORM,
  DISCOVERY_PLUGIN: quota.DISCOVERY_PLUGIN,
  BEARER_PREFIX: http.BEARER_PREFIX,
  CONTENT_TYPE_JSON: http.CONTENT_TYPE_JSON,
  CODE_ASSIST_PROJECT_PATTERN: patterns.CODE_ASSIST_PROJECT_PATTERN,
  GEMINI_QUOTA_URL: endpoints.GEMINI_QUOTA_URL
};
