var C = require('../resources/auth/jwt');

/**
 * Decode JWT payload metadata without checking its signature or authenticity.
 * Malformed base64, invalid UTF-8, and invalid JSON return an empty object.
 * @param {string} token Encoded JWT; malformed or non-string input is tolerated.
 * @returns {*} Parsed JSON payload (normally a claims object), or an empty object on failure.
 */
function jwt(token) {
  try {
    var encoded = token
      .split(C.DOT)[1]
      .replace(new RegExp(C.BASE64URL_HYPHEN_PATTERN, C.REGEX_GLOBAL), C.PLUS)
      .replace(new RegExp(C.BASE64URL_UNDERSCORE_PATTERN, C.REGEX_GLOBAL), C.SLASH);
    var alphabet = C.BASE64_ALPHABET;
    var bits = 0;
    var count = 0;
    var decoded = '';

    for (var i = 0; i < encoded.length && encoded[i] !== C.EQUALS; i++) {
      var value = alphabet.indexOf(encoded[i]);

      if (value < 0) {
        return {};
      }

      bits = (bits << C.BASE64_BITS) | value;
      count += C.BASE64_BITS;

      if (count >= C.BYTE_BITS) {
        count -= C.BYTE_BITS;
        decoded +=
          C.PERCENT_SIGN +
          (C.HEX_PADDING_ZERO + ((bits >> count) & C.BYTE_MASK).toString(C.HEX_RADIX)).slice(
            -C.HEX_BYTE_DIGITS
          );
      }
    }

    return JSON.parse(decodeURIComponent(decoded));
  } catch (_) {
    return {};
  }
}

module.exports = jwt;
