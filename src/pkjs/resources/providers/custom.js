/** Explicit constant dependencies; these alone accompany the browser factory. */
var http = require('../shared/http');

module.exports = {
  CONTENT_TYPE_JSON: http.CONTENT_TYPE_JSON,
  BEARER_PREFIX: http.BEARER_PREFIX,
  HTTP_GET: http.HTTP_GET
};
