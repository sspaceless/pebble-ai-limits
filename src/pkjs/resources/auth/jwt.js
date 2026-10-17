/** Explicit constant dependencies; these alone accompany the browser factory. */
var syntax = require('../shared/syntax');
var patterns = require('../shared/patterns');
var limits = require('../shared/limits');

module.exports = {
  DOT: syntax.DOT,
  BASE64URL_HYPHEN_PATTERN: patterns.BASE64URL_HYPHEN_PATTERN,
  REGEX_GLOBAL: patterns.REGEX_GLOBAL,
  PLUS: syntax.PLUS,
  BASE64URL_UNDERSCORE_PATTERN: patterns.BASE64URL_UNDERSCORE_PATTERN,
  SLASH: syntax.SLASH,
  BASE64_ALPHABET: syntax.BASE64_ALPHABET,
  EQUALS: syntax.EQUALS,
  BASE64_BITS: limits.BASE64_BITS,
  BYTE_BITS: limits.BYTE_BITS,
  PERCENT_SIGN: syntax.PERCENT_SIGN,
  HEX_PADDING_ZERO: syntax.HEX_PADDING_ZERO,
  BYTE_MASK: limits.BYTE_MASK,
  HEX_RADIX: limits.HEX_RADIX,
  HEX_BYTE_DIGITS: limits.HEX_BYTE_DIGITS
};
