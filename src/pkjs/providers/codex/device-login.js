var C = require('../../resources/providers/codex/device-login');
var http = require('../../network/http').request;
var jsonPost = require('./transport');
var tokens = require('./session');

var AUTH = C.AUTH_ORIGIN;
var CLIENT_ID = C.CODEX_CLIENT_ID;

function beginLogin(done) {
  jsonPost(
    C.DEVICE_CODE_PATH,
    { client_id: CLIENT_ID },
    function (error, data) {
      if (error) {
        return done(error);
      }

      var code = data.user_code || data.usercode;

      if (!data.device_auth_id || !code) {
        return done({ invalidData: true });
      }

      done(null, {
        deviceAuthId: data.device_auth_id,
        userCode: code,
        interval: Math.min(
          C.MAX_POLL_INTERVAL_SECONDS,
          Math.max(
            C.MIN_POLL_INTERVAL_SECONDS,
            Number(data.interval) || C.MIN_POLL_INTERVAL_SECONDS
          )
        ),
        expiresAt:
          Date.now() + C.DEVICE_CODE_TTL_MINUTES * C.SECONDS_PER_MINUTE * C.MILLISECONDS_PER_SECOND
      });
    },
    C.LOGIN_REQUEST_GROUP
  );
}

function pollLogin(pending, done) {
  jsonPost(
    C.DEVICE_TOKEN_PATH,
    { device_auth_id: pending.deviceAuthId, user_code: pending.userCode },
    function (error, data) {
      if (error) {
        error.pending = error.status === C.HTTP_FORBIDDEN || error.status === C.HTTP_NOT_FOUND;

        return done(error);
      }

      if (!data.authorization_code || !data.code_verifier) {
        return done({ invalidData: true });
      }

      var form = {
        grant_type: C.AUTHORIZATION_CODE_GRANT,
        client_id: CLIENT_ID,
        code: data.authorization_code,
        redirect_uri: AUTH + C.DEVICE_CALLBACK_PATH,
        code_verifier: data.code_verifier
      };
      var body = Object.keys(form)
        .map(function (key) {
          return encodeURIComponent(key) + C.EQUALS + encodeURIComponent(form[key]);
        })
        .join(C.AMPERSAND);

      http(
        C.HTTP_POST,
        AUTH + C.TOKEN_PATH,
        body,
        { 'Content-Type': C.CONTENT_TYPE_FORM },
        function (failure, result) {
          if (failure) {
            return done(failure);
          }

          var session;

          try {
            session = tokens(result);
          } catch (_) {
            return done({ invalidData: true });
          }

          done(null, session);
        },
        C.LOGIN_REQUEST_GROUP
      );
    },
    C.LOGIN_REQUEST_GROUP
  );
}

module.exports = { begin: beginLogin, poll: pollLogin };
