/** Explicit constant dependencies; these alone accompany the browser factory. */
var patterns = require('./shared/patterns');
var plans = require('./shared/plans');
var limits = require('./shared/limits');
var syntax = require('./shared/syntax');

module.exports = {
  UNKNOWN_PLAN_PATTERN: patterns.UNKNOWN_PLAN_PATTERN,
  REGEX_IGNORE_CASE: patterns.REGEX_IGNORE_CASE,
  PLAN_FREE: plans.PLAN_FREE,
  PLAN_PLUS: plans.PLAN_PLUS,
  PLAN_PRO: plans.PLAN_PRO,
  PLAN_MAX: plans.PLAN_MAX,
  PLAN_TEAM: plans.PLAN_TEAM,
  PLAN_BUSINESS: plans.PLAN_BUSINESS,
  PLAN_ENTERPRISE: plans.PLAN_ENTERPRISE,
  PLAN_EDU: plans.PLAN_EDU,
  PLAN_ULTRA: plans.PLAN_ULTRA,
  PLAN_STANDARD: plans.PLAN_STANDARD,
  GOOGLE_PLAN_PREFIX_PATTERN: patterns.GOOGLE_PLAN_PREFIX_PATTERN,
  GEMINI_PLAN_PREFIX_PATTERN: patterns.GEMINI_PLAN_PREFIX_PATTERN,
  PLAN_NAME_PATTERN: patterns.PLAN_NAME_PATTERN,
  PLAN_LABEL_MAX_LENGTH: limits.PLAN_LABEL_MAX_LENGTH,
  SPACE: syntax.SPACE,
  PROVIDER_HEADER_MAX_LENGTH: limits.PROVIDER_HEADER_MAX_LENGTH
};
