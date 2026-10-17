var C = require('../resources/providers/credentials');
var info = require('./catalog').info;
var plans = require('../plans');

/**
 * Import credentials and validate provider connection fields without network/storage effects.
 * Refresh-only imports are marked expired so renewal runs before quota retrieval.
 * @param {string} id Known non-Codex provider ID; Codex uses its own session parser.
 * @param {Object} input Form fields including credentials and provider-specific connection data.
 * @returns {Object} New normalized configuration; token expiry is in Unix seconds.
 * @throws {Error} If JSON, credentials, endpoint, or required provider fields are invalid.
 */
function parseConfig(id, input) {
  if (!info(id) || id === C.PROVIDER_CODEX) {
    throw new Error(C.ERROR_INVALID_PROVIDER);
  }

  var raw = (input.credentials || '').trim();
  var isJson = raw.charAt(0) === C.OPEN_BRACE;
  var parsed = isJson ? JSON.parse(raw) : {};
  var oauth = parsed.claudeAiOauth || parsed;
  var config = {
    provider: id,
    mode: C.CONNECTION_MODE_DIRECT,
    accessToken: oauth.accessToken || oauth.access_token || (isJson ? '' : raw),
    refreshToken: oauth.refreshToken || oauth.refresh_token || '',
    expiresAt: oauth.expiry_date
      ? Math.floor(oauth.expiry_date / C.MILLISECONDS_PER_SECOND)
      : oauth.expiresAt
        ? Math.floor(oauth.expiresAt / C.MILLISECONDS_PER_SECOND)
        : 0,
    plan:
      id === C.PROVIDER_CLAUDE
        ? plans.label(oauth.subscriptionType || oauth.subscription_type)
        : id === C.PROVIDER_GEMINI_CLI
          ? plans.label(oauth.userTierName)
          : '',
    clientId: oauth.client_id || input.clientId || '',
    clientSecret: oauth.client_secret || input.clientSecret || '',
    project: (input.project || '').trim(),
    model: (input.model || '').trim(),
    secondaryModel: (input.secondaryModel || '').trim(),
    quotaMetric: (input.quotaMetric || '').trim()
  };

  if (id === C.PROVIDER_CUSTOM) {
    if (!new RegExp(C.HTTPS_ENDPOINT_PATTERN).test(input.url || '')) {
      throw new Error(C.ERROR_HTTPS_ENDPOINT_REQUIRED);
    }

    if (new RegExp(C.WHITESPACE_PATTERN).test((input.credentials || '').trim())) {
      throw new Error(C.ERROR_INVALID_BEARER_TOKEN);
    }

    return {
      provider: id,
      mode: C.CONNECTION_MODE_DIRECT,
      url: input.url,
      name: String(input.name || C.PROVIDER_NAME_CUSTOM).slice(
        0,
        C.CUSTOM_PROVIDER_NAME_MAX_LENGTH
      ),
      accessToken: (input.credentials || '').trim()
    };
  }

  if (
    (!config.accessToken && !config.refreshToken) ||
    typeof config.accessToken !== 'string' ||
    new RegExp(C.WHITESPACE_PATTERN).test(config.accessToken)
  ) {
    throw new Error(C.ERROR_CREDENTIALS_REQUIRED);
  }

  if (!config.accessToken && config.refreshToken) {
    config.expiresAt = 1;
  }

  if (id === C.PROVIDER_CLAUDE_API) {
    config.apiKey = config.accessToken;

    if (!config.model) {
      throw new Error(C.ERROR_MODEL_REQUIRED);
    }
  }

  if (
    id === C.PROVIDER_GEMINI_CLI &&
    config.project &&
    !new RegExp(C.CODE_ASSIST_PROJECT_PATTERN).test(config.project)
  ) {
    throw new Error(C.ERROR_CODE_ASSIST_PROJECT_REQUIRED);
  }

  if (
    id === C.PROVIDER_GEMINI_API &&
    (!new RegExp(C.PROJECT_NUMBER_PATTERN).test(config.project) ||
      !config.quotaMetric ||
      !config.model ||
      new RegExp(C.AI_STUDIO_KEY_PATTERN).test(config.accessToken))
  ) {
    throw new Error(C.ERROR_CLOUD_OAUTH_PROJECT_NUMBER_METRIC_AND_MODEL_REQUIRED);
  }

  return config;
}

module.exports = parseConfig;
