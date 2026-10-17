/** Explicit constant dependencies; these alone accompany the browser factory. */
var patterns = require('../shared/patterns');
var markup = require('../shared/markup');

module.exports = {
  HTML_AMPERSAND_PATTERN: patterns.HTML_AMPERSAND_PATTERN,
  REGEX_GLOBAL: patterns.REGEX_GLOBAL,
  HTML_AMPERSAND: markup.HTML_AMPERSAND,
  HTML_LESS_THAN_PATTERN: patterns.HTML_LESS_THAN_PATTERN,
  HTML_LESS_THAN: markup.HTML_LESS_THAN,
  HTML_GREATER_THAN_PATTERN: patterns.HTML_GREATER_THAN_PATTERN,
  HTML_GREATER_THAN: markup.HTML_GREATER_THAN,
  HTML_QUOTE_PATTERN: patterns.HTML_QUOTE_PATTERN,
  HTML_QUOTE: markup.HTML_QUOTE,
  BUTTON_OPEN: markup.BUTTON_OPEN,
  BUTTON_ACTION_HANDLER: markup.BUTTON_ACTION_HANDLER,
  BUTTON_ACTION_END: markup.BUTTON_ACTION_END,
  BUTTON_CLOSE: markup.BUTTON_CLOSE
};
