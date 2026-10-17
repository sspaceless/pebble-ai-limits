var C = require('../resources/settings/provider-icon');
var SVG = require('../resources/provider-svg');

/**
 * Render a brand mark shared by subscription and API provider variants.
 * @param {string} id Provider catalog ID; unsupported values use the Codex mark.
 * @returns {string} HTML span containing the selected canonical SVG.
 */
module.exports = function (id) {
  var name =
    id === C.PROVIDER_GEMINI_CLI || id === C.PROVIDER_GEMINI_API
      ? C.PROVIDER_GEMINI_CLI
      : id === C.PROVIDER_CLAUDE || id === C.PROVIDER_CLAUDE_API
        ? C.PROVIDER_CLAUDE
        : id === C.PROVIDER_CUSTOM
          ? C.PROVIDER_CUSTOM
          : C.PROVIDER_CODEX;
  var className =
    name === C.PROVIDER_CUSTOM
      ? C.CUSTOM_ICON_CLASS
      : name === C.PROVIDER_CODEX
        ? C.CODEX_ICON_CLASS
        : C.PROVIDER_ICON_CLASS;

  return C.ICON_OPEN + className + C.ICON_CLASS_END + SVG[name] + C.ICON_CLOSE;
};
