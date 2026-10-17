var C = require('../resources/settings/markup');

/**
 * Escape ampersands, angle brackets, and double quotes for generated HTML.
 * This is HTML escaping, not JavaScript/URL sanitization or an HTML sanitizer.
 * @param {*} value Value coerced with String() before escaping.
 * @returns {string} Text safe for HTML content and double-quoted attribute values.
 */
function escape(value) {
  return String(value)
    .replace(new RegExp(C.HTML_AMPERSAND_PATTERN, C.REGEX_GLOBAL), C.HTML_AMPERSAND)
    .replace(new RegExp(C.HTML_LESS_THAN_PATTERN, C.REGEX_GLOBAL), C.HTML_LESS_THAN)
    .replace(new RegExp(C.HTML_GREATER_THAN_PATTERN, C.REGEX_GLOBAL), C.HTML_GREATER_THAN)
    .replace(new RegExp(C.HTML_QUOTE_PATTERN, C.REGEX_GLOBAL), C.HTML_QUOTE);
}

/**
 * Build a settings action button with escaped text and serialized command data.
 * @param {string} label Plain-text label; markup in the label is escaped too.
 * @param {Object} data JSON-serializable settings action forwarded to closePage().
 * @param {string} [className] Optional CSS classes, escaped for the HTML attribute.
 * @returns {string} Button HTML with an inline action handler.
 * @throws {TypeError} If command data cannot be serialized as JSON.
 */
function button(label, data, className) {
  return (
    C.BUTTON_OPEN +
    escape(className || '') +
    C.BUTTON_ACTION_HANDLER +
    escape(JSON.stringify(data)) +
    C.BUTTON_ACTION_END +
    escape(label) +
    C.BUTTON_CLOSE
  );
}

module.exports = { escape: escape, button: button };
