var C = require('../resources/providers/google-oauth');
var exchange = require('./oauth').exchange;

// Public installed-application credentials from Google's open-source Gemini CLI.
var GOOGLE_CLIENT = C.GOOGLE_CLIENT_ID;
var GOOGLE_SECRET = C.GOOGLE_INSTALLED_APP_SECRET;

/** Renew Google credentials using supplied client metadata or the installed-app defaults. */
exports.renew = function (config, done) {
  var params = {
    grant_type: C.REFRESH_TOKEN_GRANT,
    refresh_token: config.refreshToken,
    client_id: config.clientId || GOOGLE_CLIENT,
    client_secret: config.clientSecret || (config.clientId ? '' : GOOGLE_SECRET)
  };
  var body = Object.keys(params)
    .map(function (k) {
      return encodeURIComponent(k) + C.EQUALS + encodeURIComponent(params[k]);
    })
    .join(C.AMPERSAND);

  exchange(C.GOOGLE_TOKEN_URL, body, { 'Content-Type': C.CONTENT_TYPE_FORM }, config, done);
};
