var C = require('../resources/settings/page');
var serialize = require('./serialize');
var closeRuntime = require('./close-runtime');
var SETTINGS_CSS = require('./styles');
var CODEX_SVG = require('../provider-icons').SVG.codex;

/**
 * Compose the configuration shell and install the browser closePage bridge.
 * Markup and scripts must be trusted; callers escape any user data before composition.
 * @param {string} body Trusted HTML for the page body.
 * @param {string} subtitle Trusted HTML/text for the eyebrow heading.
 * @param {string} [script] Trusted JavaScript added after the browser bridge.
 * @returns {string} Complete settings HTML document.
 */
function page(body, subtitle, script) {
  return (
    C.DOCUMENT_START +
    SETTINGS_CSS +
    C.DOCUMENT_BODY_START +
    C.BRAND_HEADER_OPEN +
    CODEX_SVG +
    C.BRAND_HEADER_CLOSE +
    subtitle +
    C.DIV_CLOSE +
    body +
    C.PAGE_SCRIPT_OPEN +
    serialize(closeRuntime, []) +
    (script || '') +
    C.DOCUMENT_END
  );
}

module.exports = page;
