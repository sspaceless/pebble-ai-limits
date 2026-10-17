var C = require('../resources/settings/device-login');

/** Self-contained WebView module, serialized into configuration HTML.
 * Dependencies must be browser globals or explicit arguments: CommonJS imports
 * and companion storage are unavailable inside the WebView.
 * Tokens are staged in the draft account; only Save and close commits them.
 */
module.exports = function (mark, render) {
  var deviceGeneration = 0;
  var deviceTimer = null;
  var deviceRequest = null;
  var AUTH_ORIGIN = C.AUTH_ORIGIN;
  var CLIENT_ID = C.CODEX_CLIENT_ID;
  var REQUEST_TIMEOUT_MS = C.DEVICE_REQUEST_TIMEOUT_MS;

  function stopDeviceLogin() {
    deviceGeneration++;

    if (deviceTimer) {
      clearTimeout(deviceTimer);
      deviceTimer = null;
    }

    if (deviceRequest) {
      var request = deviceRequest;

      deviceRequest = null;
      request.abort();
    }
  }

  function postDevice(path, data, done) {
    var request = new XMLHttpRequest();

    deviceRequest = request;
    request.open(C.HTTP_POST, AUTH_ORIGIN + path, true);
    request.timeout = REQUEST_TIMEOUT_MS;
    request.setRequestHeader(C.HEADER_CONTENT_TYPE, C.CONTENT_TYPE_JSON);
    request.onload = function () {
      if (deviceRequest === request) {
        deviceRequest = null;
      }

      var body;

      try {
        body = JSON.parse(request.responseText);
      } catch (_) {
        return done({ error: true });
      }

      if (request.status < C.HTTP_OK || request.status >= C.HTTP_REDIRECT_START) {
        return done({ error: true, status: request.status, body: body });
      }

      done(null, body);
    };

    request.onerror = function () {
      if (deviceRequest === request) {
        deviceRequest = null;
      }

      done({ error: true });
    };

    request.ontimeout = request.onerror;

    request.send(JSON.stringify(data));
  }

  function startCodexLogin(account) {
    stopDeviceLogin();
    var generation = deviceGeneration;
    var status = document.getElementById(C.ID_DEVICE_LOGIN_STATUS);
    var panel = document.getElementById(C.ID_DEVICE_CODE_PANEL);
    var code = document.getElementById(C.ID_DEVICE_CODE);

    status.textContent = C.REQUESTING_A_SIGN_IN_CODE;
    panel.hidden = true;
    postDevice(C.DEVICE_CODE_PATH, { client_id: CLIENT_ID }, function (error, data) {
      if (generation !== deviceGeneration) {
        return;
      }

      if (error || !data.device_auth_id || !(data.user_code || data.usercode)) {
        status.textContent = C.COULD_NOT_START_SIGN_IN_CHECK_YOUR_INTERNET_CONNECTION_AND_TRY_AGAIN;

        return;
      }

      var userCode = data.user_code || data.usercode;
      var interval = Math.max(
        C.MIN_POLL_INTERVAL_SECONDS,
        Math.min(C.MAX_POLL_INTERVAL_SECONDS, Number(data.interval) || C.MIN_POLL_INTERVAL_SECONDS)
      );

      code.textContent = userCode;
      panel.hidden = false;
      status.textContent = C.ENTER_THE_CODE_IN_SAFARI_WAITING_FOR_APPROVAL;

      function poll() {
        if (generation !== deviceGeneration) {
          return;
        }

        postDevice(
          C.DEVICE_TOKEN_PATH,
          { device_auth_id: data.device_auth_id, user_code: userCode },
          function (failure, result) {
            if (generation !== deviceGeneration) {
              return;
            }

            if (
              failure &&
              (failure.status === C.HTTP_FORBIDDEN || failure.status === C.HTTP_NOT_FOUND)
            ) {
              deviceTimer = setTimeout(poll, interval * C.MILLISECONDS_PER_SECOND);

              return;
            }

            if (failure || !result.authorization_code || !result.code_verifier) {
              status.textContent = C.SIGN_IN_FAILED_OR_EXPIRED_TRY_AGAIN;

              return;
            }

            var form = {
              grant_type: C.AUTHORIZATION_CODE_GRANT,
              client_id: CLIENT_ID,
              code: result.authorization_code,
              redirect_uri: C.HTTPS_AUTH_OPENAI_COM_DEVICEAUTH_CALLBACK,
              code_verifier: result.code_verifier
            };
            var body = Object.keys(form)
              .map(function (key) {
                return encodeURIComponent(key) + C.EQUALS + encodeURIComponent(form[key]);
              })
              .join(C.AMPERSAND);
            var tokenRequest = new XMLHttpRequest();

            deviceRequest = tokenRequest;
            tokenRequest.open(C.HTTP_POST, AUTH_ORIGIN + C.TOKEN_PATH, true);
            tokenRequest.timeout = REQUEST_TIMEOUT_MS;
            tokenRequest.setRequestHeader(C.HEADER_CONTENT_TYPE, C.CONTENT_TYPE_FORM);
            tokenRequest.onload = function () {
              if (deviceRequest === tokenRequest) {
                deviceRequest = null;
              }

              if (generation !== deviceGeneration) {
                return;
              }

              var tokens;

              try {
                tokens = JSON.parse(tokenRequest.responseText);
              } catch (_) {
                tokens = null;
              }

              if (
                tokenRequest.status < C.HTTP_OK ||
                tokenRequest.status >= C.HTTP_REDIRECT_START ||
                !tokens ||
                !tokens.access_token
              ) {
                status.textContent = C.COULD_NOT_COMPLETE_CHAT_GPT_SIGN_IN_TRY_AGAIN;

                return;
              }

              account.connectionData = tokens;
              account.configured = true;
              status.textContent = C.SIGNED_IN_TAP_SAVE_AND_CLOSE_TO_APPLY_THIS_ACCOUNT;
              document.getElementById(C.ID_CONNECTION_ERROR).textContent = '';
              mark();
              render();
            };

            tokenRequest.onerror = function () {
              if (deviceRequest === tokenRequest) {
                deviceRequest = null;
              }

              if (generation === deviceGeneration) {
                status.textContent = C.COULD_NOT_COMPLETE_CHAT_GPT_SIGN_IN_TRY_AGAIN;
              }
            };

            tokenRequest.ontimeout = tokenRequest.onerror;

            tokenRequest.send(body);
          }
        );
      }

      poll();
    });
  }

  return { start: startCodexLogin, stop: stopDeviceLogin };
};

// Serialized browser factories carry only their own constant dependencies.
module.exports.constants = C;
