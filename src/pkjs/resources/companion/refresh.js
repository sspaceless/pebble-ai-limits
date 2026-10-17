/** Explicit constant dependencies; these alone accompany the browser factory. */
var limits = require('../shared/limits');
var syntax = require('../shared/syntax');
var text = require('../shared/text');
var http = require('../shared/http');

module.exports = {
  TOKEN_EXPIRY_MARGIN_SECONDS: limits.TOKEN_EXPIRY_MARGIN_SECONDS,
  OPEN_APP_SETTINGS: syntax.OPEN_APP_SETTINGS,
  UPDATING_STATUS: text.UPDATING_STATUS,
  HTTP_UNAUTHORIZED: http.HTTP_UNAUTHORIZED,
  MILLISECONDS_PER_SECOND: limits.MILLISECONDS_PER_SECOND
};
