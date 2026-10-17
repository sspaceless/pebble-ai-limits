/** Explicit constant dependencies; these alone accompany the browser factory. */
var limits = require('../shared/limits');
var patterns = require('../shared/patterns');

module.exports = {
  ACCOUNT_NAME_MAX_LENGTH: limits.ACCOUNT_NAME_MAX_LENGTH,
  ACCOUNT_CONTROL_CHARACTER_PATTERN: patterns.ACCOUNT_CONTROL_CHARACTER_PATTERN
};
