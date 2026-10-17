var plans = require('../plans');

/**
 * Wrap provider normalization with consistent errors and a fallback plan label.
 * Normalization exceptions become an invalid-data callback error; config is not mutated.
 * @param {Function} normalize Converts (payload, config) into a normalized snapshot.
 * @param {Object} config Provider configuration supplying optional fallback plan metadata.
 * @param {Function} done Error-first callback receiving (error, snapshot).
 * @returns {Function} Error-first HTTP response callback accepting (error, payload).
 */
module.exports = function (normalize, config, done) {
  return function (error, payload) {
    if (error) {
      return done(error);
    }

    var result;

    try {
      result = normalize(payload, config);
    } catch (_) {
      return done({ invalidData: true });
    }

    if (!result.plan) {
      result.plan = plans.label(config.plan);
    }

    done(null, result);
  };
};
