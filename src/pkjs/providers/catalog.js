var C = require('../resources/providers/catalog');

var CATALOG = [
  { id: C.PROVIDER_CODEX, name: C.PROVIDER_NAME_CODEX, kind: C.KIND_SUBSCRIPTION },
  { id: C.PROVIDER_CLAUDE, name: C.PROVIDER_NAME_CLAUDE, kind: C.KIND_SUBSCRIPTION },
  { id: C.PROVIDER_GEMINI_CLI, name: C.PROVIDER_NAME_GEMINI_CLI, kind: C.KIND_SUBSCRIPTION },
  { id: C.PROVIDER_CLAUDE_API, name: C.PROVIDER_NAME_CLAUDE_API, kind: C.KIND_API },
  { id: C.PROVIDER_GEMINI_API, name: C.PROVIDER_NAME_GEMINI_API, kind: C.KIND_API },
  { id: C.PROVIDER_CUSTOM, name: C.PROVIDER_NAME_CUSTOM, kind: C.PROVIDER_CUSTOM }
];

/**
 * Find provider metadata without changing catalog order or creating entries.
 * @param {string} id Provider catalog ID.
 * @returns {?Object} Shared catalog entry, or null when the provider is unknown.
 */
function info(id) {
  for (var i = 0; i < CATALOG.length; i++) {
    if (CATALOG[i].id === id) {
      return CATALOG[i];
    }
  }

  return null;
}

module.exports = { entries: CATALOG, info: info };
