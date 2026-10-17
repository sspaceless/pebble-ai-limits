/** Explicit constant dependencies; these alone accompany the browser factory. */
var providers = require('../shared/providers');
var dom = require('../shared/dom');

module.exports = {
  PROVIDER_GEMINI_CLI: providers.PROVIDER_GEMINI_CLI,
  PROVIDER_GEMINI_API: providers.PROVIDER_GEMINI_API,
  PROVIDER_CLAUDE: providers.PROVIDER_CLAUDE,
  PROVIDER_CLAUDE_API: providers.PROVIDER_CLAUDE_API,
  PROVIDER_CUSTOM: providers.PROVIDER_CUSTOM,
  PROVIDER_CODEX: providers.PROVIDER_CODEX,
  CUSTOM_ICON_CLASS: dom.CUSTOM_ICON_CLASS,
  CODEX_ICON_CLASS: dom.CODEX_ICON_CLASS,
  PROVIDER_ICON_CLASS: dom.PROVIDER_ICON_CLASS,
  ICON_OPEN: dom.ICON_OPEN,
  ICON_CLASS_END: dom.ICON_CLASS_END,
  ICON_CLOSE: dom.ICON_CLOSE
};
