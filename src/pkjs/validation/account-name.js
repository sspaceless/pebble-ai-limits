var C = require('../resources/validation/account-name');

/**
 * Check the account-name contract shared by storage and the WebView.
 * Length is measured after trimming; control characters are rejected in the original input.
 * @param {*} value Candidate name; non-string values are invalid.
 * @returns {boolean} Whether the candidate is nonempty and satisfies the configured limit.
 */
module.exports = function (value) {
  return (
    typeof value === 'string' &&
    !!value.trim() &&
    value.trim().length <= C.ACCOUNT_NAME_MAX_LENGTH &&
    !new RegExp(C.ACCOUNT_CONTROL_CHARACTER_PATTERN).test(value)
  );
};

module.exports.constants = C;
