/** Explicit constant dependencies; these alone accompany the browser factory. */
var http = require('../shared/http');
var limits = require('../shared/limits');

module.exports = {
  HTTP_POST: http.HTTP_POST,
  MILLISECONDS_PER_SECOND: limits.MILLISECONDS_PER_SECOND
};
