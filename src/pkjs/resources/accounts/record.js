/** Explicit constant dependencies; these alone accompany the browser factory. */
var errors = require('../shared/errors');
var syntax = require('../shared/syntax');
var limits = require('../shared/limits');

module.exports = {
  ERROR_USE_A_NAME_OF_1_16_CHARACTERS: errors.ERROR_USE_A_NAME_OF_1_16_CHARACTERS,
  HYPHEN: syntax.HYPHEN,
  IDENTIFIER_RADIX: limits.IDENTIFIER_RADIX,
  RANDOM_PREFIX_LENGTH: limits.RANDOM_PREFIX_LENGTH,
  RANDOM_SUFFIX_END: limits.RANDOM_SUFFIX_END
};
