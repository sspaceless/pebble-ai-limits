/** Explicit constant dependencies; these alone accompany the browser factory. */
var errors = require('../../shared/errors');
var limits = require('../../shared/limits');
var patterns = require('../../shared/patterns');

module.exports = {
  ERROR_INVALID_QUOTAS: errors.ERROR_INVALID_QUOTAS,
  PERCENT_MAX: limits.PERCENT_MAX,
  GEMINI_MODEL_PREFIX_PATTERN: patterns.GEMINI_MODEL_PREFIX_PATTERN,
  MODEL_NOTE_MAX_LENGTH: limits.MODEL_NOTE_MAX_LENGTH
};
