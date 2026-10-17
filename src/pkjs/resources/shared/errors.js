var limits = require('./limits');

/** Canonical errors values. */
module.exports = {
  ERROR_ACCOUNT_NOT_FOUND: 'Account not found',
  ERROR_INVALID_ACCOUNT_ORDER: 'Invalid account order',
  ERROR_UNKNOWN_PROVIDER: 'Unknown provider',
  ERROR_USE_A_NAME_OF_1_16_CHARACTERS:
    'Use a name of 1–' + limits.ACCOUNT_NAME_MAX_LENGTH + ' characters',
  ERROR_INVALID_SETTINGS: 'Invalid settings',
  ERROR_INVALID_ACCOUNT: 'Invalid account',
  ERROR_ACCOUNT_MISMATCH: 'Account mismatch',
  ERROR_ACCOUNT_NO_LONGER_EXISTS: 'Account no longer exists',
  ERROR_MISSING_CONNECTION_ACCOUNT: 'Missing connection account',
  ERROR_INVALID_SELECTION: 'Invalid selection',
  ERROR_UNKNOWN_ACTION: 'Unknown action',
  ERROR_INVALID_LIMITS: 'Invalid limits',
  ERROR_MODEL_LIMITS_UNAVAILABLE: 'Model limits unavailable',
  ERROR_INVALID_USAGE: 'Invalid usage',
  ERROR_INVALID_USAGE_RESPONSE: 'Invalid usage response',
  ERROR_MISSING_ACCESS_TOKEN: 'Missing access token',
  ERROR_MISSING_ACCOUNT_ID: 'Missing account ID',
  ERROR_INVALID_PROVIDER: 'Invalid provider',
  ERROR_HTTPS_ENDPOINT_REQUIRED: 'HTTPS endpoint required',
  ERROR_INVALID_BEARER_TOKEN: 'Invalid bearer token',
  ERROR_CREDENTIALS_REQUIRED: 'Credentials required',
  ERROR_MODEL_REQUIRED: 'Model required',
  ERROR_CODE_ASSIST_PROJECT_REQUIRED: 'Code Assist project required',
  ERROR_CLOUD_OAUTH_PROJECT_NUMBER_METRIC_AND_MODEL_REQUIRED:
    'Cloud OAuth, project number, metric and model required',
  ERROR_INVALID_QUOTA: 'Invalid quota',
  ERROR_INVALID_TIMESTAMP: 'Invalid timestamp',
  ERROR_INVALID_METRICS: 'Invalid metrics',
  ERROR_REQUEST_QUOTA_METRIC_UNAVAILABLE: 'Request quota metric unavailable',
  ERROR_AMBIGUOUS_QUOTA_DIMENSIONS: 'Ambiguous quota dimensions',
  ERROR_NO_MATCHING_QUOTAS: 'No matching quotas',
  ERROR_INVALID_QUOTAS: 'Invalid quotas'
};
