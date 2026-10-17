var C = require('../resources/network/http');

/** Shared JSON transport. Cancellation suppresses callbacks within one request group. */
var REQUEST_TIMEOUT_MS = C.REQUEST_TIMEOUT_MS;
var requestGenerations = { usage: 0, login: 0 };

/**
 * Request JSON with a timeout and cancellation-group callback suppression.
 * Response bodies are not forwarded as errors; cancellation does not abort the XHR.
 * @param {string} method HTTP method.
 * @param {string} url Full provider endpoint.
 * @param {?string} body Encoded request body, or null for bodyless requests.
 * @param {?Object<string, string>} headers Headers to set on the request.
 * @param {Function} done Error-first callback receiving (error, parsedData), at most once.
 * @param {string} [requestGroup=usage] Group whose cancellation suppresses pending callbacks.
 * @returns {void} Results are reported through done() unless its group is cancelled.
 */
function http(method, url, body, headers, done, requestGroup) {
  var group = requestGroup || C.USAGE_REQUEST_GROUP;
  var xhr = new XMLHttpRequest();
  var epoch = requestGenerations[group];
  var ended = false;

  function finish(error, data) {
    if (ended || epoch !== requestGenerations[group]) {
      return;
    }

    ended = true;
    done(error, data);
  }

  xhr.open(method, url, true);
  xhr.timeout = REQUEST_TIMEOUT_MS;
  Object.keys(headers || {}).forEach(function (key) {
    xhr.setRequestHeader(key, headers[key]);
  });
  xhr.onload = function () {
    var data;

    try {
      data = JSON.parse(xhr.responseText);
    } catch (_) {
      /* Ignore unavailable optional data; use the fallback below. */
    }

    if (xhr.status < C.HTTP_OK || xhr.status >= C.HTTP_REDIRECT_START) {
      // Do not expose response bodies, tokens, or authorization codes to logs/watch messages.
      var reason = null;

      if (data && data.error && Array.isArray(data.error.details)) {
        data.error.details.forEach(function (detail) {
          if (detail.reason === C.SUBSCRIPTION_REQUIRED_REASON) {
            reason = detail.reason;
          }
        });
      }

      return finish({
        status: xhr.status,
        reason: reason,
        oauthCode: data && typeof data.error === 'string' ? data.error : null
      });
    }

    if (!data) {
      return finish({ status: 0, invalidData: true });
    }

    finish(null, data);
  };

  xhr.onerror = function () {
    finish({ status: 0 });
  };

  xhr.ontimeout = xhr.onerror;

  xhr.send(body || null);
}

module.exports = {
  request: http,
  cancel: function (requestGroup) {
    var group = requestGroup || C.USAGE_REQUEST_GROUP;

    requestGenerations[group]++;
  }
};
