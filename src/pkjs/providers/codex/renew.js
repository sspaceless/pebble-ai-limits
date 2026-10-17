var C = require('../../resources/providers/codex/renew');
var jsonPost = require('./transport');
var tokens = require('./session');

var CLIENT_ID = C.CODEX_CLIENT_ID;

function renew(config, done) {
  if (!config.refreshToken) {
    return done({ status: C.HTTP_UNAUTHORIZED });
  }

  jsonPost(
    C.TOKEN_PATH,
    { grant_type: C.REFRESH_TOKEN_GRANT, client_id: CLIENT_ID, refresh_token: config.refreshToken },
    function (error, response) {
      if (error) {
        return done(error);
      }

      var session;

      try {
        session = tokens(response, config);
      } catch (_) {
        return done({ invalidData: true });
      }

      done(null, session);
    }
  );
}

module.exports = renew;
