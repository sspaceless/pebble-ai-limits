/** Explicit constant dependencies; these alone accompany the browser factory. */
var patterns = require('../shared/patterns');
var syntax = require('../shared/syntax');

module.exports = {
  HTML_LESS_THAN_PATTERN: patterns.HTML_LESS_THAN_PATTERN,
  REGEX_GLOBAL: patterns.REGEX_GLOBAL,
  ESCAPED_LESS_THAN: syntax.ESCAPED_LESS_THAN,
  OPEN_PAREN: syntax.OPEN_PAREN,
  CLOSE_PAREN: syntax.CLOSE_PAREN,
  FACTORY_CONSTANT_SCOPE_START: syntax.FACTORY_CONSTANT_SCOPE_START,
  FACTORY_CONSTANT_SCOPE_END: syntax.FACTORY_CONSTANT_SCOPE_END,
  OPEN_BRACE: syntax.OPEN_BRACE,
  COLON: syntax.COLON,
  COMMA: syntax.COMMA,
  CLOSE_BRACE: syntax.CLOSE_BRACE,
  CALL_END: syntax.CALL_END
};
