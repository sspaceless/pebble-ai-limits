var C = require('./resources/plans');

// Only explicit provider metadata is used; model names and quota size are not plans.
/**
 * Normalize explicit provider plan metadata for display without inferring a plan.
 * Known names are canonicalized; unknown markers and unsafe names become empty strings.
 * @param {*} input Reported provider plan name.
 * @returns {string} Normalized, length-limited label, or an empty string.
 */
function label(input) {
  var value = input;

  if (typeof value !== 'string') {
    return '';
  }

  value = value.trim();

  if (!value || new RegExp(C.UNKNOWN_PLAN_PATTERN, C.REGEX_IGNORE_CASE).test(value)) {
    return '';
  }

  var known = {
    free: C.PLAN_FREE,
    plus: C.PLAN_PLUS,
    pro: C.PLAN_PRO,
    max: C.PLAN_MAX,
    team: C.PLAN_TEAM,
    business: C.PLAN_BUSINESS,
    enterprise: C.PLAN_ENTERPRISE,
    edu: C.PLAN_EDU,
    education: C.PLAN_EDU,
    ultra: C.PLAN_ULTRA,
    standard: C.PLAN_STANDARD
  };

  if (Object.prototype.hasOwnProperty.call(known, value.toLowerCase())) {
    return known[value.toLowerCase()];
  }

  value = value
    .replace(new RegExp(C.GOOGLE_PLAN_PREFIX_PATTERN, C.REGEX_IGNORE_CASE), '')
    .replace(new RegExp(C.GEMINI_PLAN_PREFIX_PATTERN, C.REGEX_IGNORE_CASE), '');

  if (!new RegExp(C.PLAN_NAME_PATTERN).test(value)) {
    return '';
  }

  return value.slice(0, C.PLAN_LABEL_MAX_LENGTH);
}

/**
 * Append a valid plan label to a provider title within the watch header limit.
 * @param {string} provider Provider title; returned unchanged when no valid plan exists.
 * @param {*} plan Reported plan metadata passed through label().
 * @returns {string} Provider title with an optional normalized plan suffix.
 */
function header(provider, plan) {
  var name = label(plan);

  return name ? (provider + C.SPACE + name).slice(0, C.PROVIDER_HEADER_MAX_LENGTH) : provider;
}

module.exports = { label: label, header: header };
