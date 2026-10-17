/** Explicit constant dependencies; these alone accompany the browser factory. */
var errors = require('../../shared/errors');
var endpoints = require('../../shared/endpoints');
var limits = require('../../shared/limits');
var http = require('../../shared/http');

module.exports = {
  ERROR_MISSING_ACCESS_TOKEN: errors.ERROR_MISSING_ACCESS_TOKEN,
  CODEX_CLAIMS_NAMESPACE: endpoints.CODEX_CLAIMS_NAMESPACE,
  ERROR_MISSING_ACCOUNT_ID: errors.ERROR_MISSING_ACCOUNT_ID,
  MILLISECONDS_PER_SECOND: limits.MILLISECONDS_PER_SECOND,
  CONNECTION_MODE_DIRECT: http.CONNECTION_MODE_DIRECT
};
