/** Explicit constant dependencies; these alone accompany the browser factory. */
var quota = require('../../shared/quota');
var errors = require('../../shared/errors');
var limits = require('../../shared/limits');

module.exports = {
  CLAUDE_SESSION_FIELD: quota.CLAUDE_SESSION_FIELD,
  CLAUDE_WEEK_FIELD: quota.CLAUDE_WEEK_FIELD,
  ERROR_INVALID_USAGE: errors.ERROR_INVALID_USAGE,
  CLAUDE_SESSION_WINDOW_MINUTES: limits.CLAUDE_SESSION_WINDOW_MINUTES,
  CLAUDE_WEEK_WINDOW_MINUTES: limits.CLAUDE_WEEK_WINDOW_MINUTES
};
