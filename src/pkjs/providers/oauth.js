var C = require('../resources/providers/oauth');
var http = require('../network/http').request;
var number = require('./quota').number;

/**
 * Exchange a refresh token while preserving metadata and omitted rotated tokens.
 * Creates a shallow configuration copy; the original configuration is not mutated.
 * @param {string} url OAuth token endpoint.
 * @param {string} body Already encoded token-request body.
 * @param {Object<string, string>} headers Request headers matching the body encoding.
 * @param {Object} config Existing provider credentials/configuration.
 * @param {Function} done Error-first callback receiving (error, renewedConfig).
 * @returns {void} Completion is reported through done().
 */
exports.exchange = function (url, body, headers, config, done) {
  http(C.HTTP_POST, url, body, headers, function (error, result) {
    if (error) {
      return done(error);
    }

    if (typeof result.access_token !== 'string' || !result.access_token) {
      return done({ invalidData: true });
    }

    var next = {};

    Object.keys(config).forEach(function (k) {
      next[k] = config[k];
    });
    next.accessToken = result.access_token;
    next.refreshToken = result.refresh_token || config.refreshToken;
    next.expiresAt = number(result.expires_in)
      ? Math.floor(Date.now() / C.MILLISECONDS_PER_SECOND) + result.expires_in
      : 0;
    done(null, next);
  });
};
