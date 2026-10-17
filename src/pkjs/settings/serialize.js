var C = require('../resources/settings/serialize');

/**
 * Encode JSON for an inline script while preserving the original decoded value.
 * Escaping less-than characters prevents user data from closing the script element.
 * @param {*} value JSON-serializable value; undefined is unsupported.
 * @returns {string} Escaped JavaScript/JSON literal.
 * @throws {TypeError} If serialization fails or does not yield a JSON string.
 */
function json(value) {
  return JSON.stringify(value).replace(
    new RegExp(C.HTML_LESS_THAN_PATTERN, C.REGEX_GLOBAL),
    C.ESCAPED_LESS_THAN
  );
}

/**
 * Serialize a self-contained browser factory and its optional .constants object.
 * Other companion variables/imports are not captured by Function#toString().
 * @param {Function} factory Browser factory with optional JSON-serializable constants.
 * @returns {string} JavaScript expression evaluating to the factory in the WebView.
 * @throws {TypeError} If declared constants cannot be serialized.
 */
function source(factory) {
  var expression = C.OPEN_PAREN + factory.toString() + C.CLOSE_PAREN;

  return factory.constants
    ? C.FACTORY_CONSTANT_SCOPE_START +
        expression +
        C.FACTORY_CONSTANT_SCOPE_END +
        json(factory.constants) +
        C.CLOSE_PAREN
    : expression;
}

/**
 * Build an inline program from a browser runtime, public arguments, and factories.
 * Only explicit arguments and factory constants cross into the separate WebView runtime.
 * @param {Function} runtime Self-contained browser entry function.
 * @param {Array<*>} args JSON-serializable positional arguments; undefined is unsupported.
 * @param {Object<string, Function>} [modules] Named factories passed as the final argument.
 * @returns {string} JavaScript program that initializes the browser runtime.
 * @throws {TypeError} If arguments or factory constants cannot be serialized.
 */
module.exports = function (runtime, args, modules) {
  var values = args.map(json);

  if (modules) {
    values.push(
      C.OPEN_BRACE +
        Object.keys(modules)
          .map(function (key) {
            return JSON.stringify(key) + C.COLON + source(modules[key]);
          })
          .join(C.COMMA) +
        C.CLOSE_BRACE
    );
  }

  return source(runtime) + C.OPEN_PAREN + values.join(C.COMMA) + C.CALL_END;
};

module.exports.source = source;
