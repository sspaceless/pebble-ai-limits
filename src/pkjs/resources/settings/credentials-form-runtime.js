/** Explicit constant dependencies; these alone accompany the browser factory. */
var dom = require('../shared/dom');
var limits = require('../shared/limits');
var text = require('../shared/text');
var actions = require('../shared/actions');
var quota = require('../shared/quota');
var endpoints = require('../shared/endpoints');

module.exports = {
  ID_CREDENTIAL_FILE: dom.ID_CREDENTIAL_FILE,
  MAX_CREDENTIAL_FILE_BYTES: limits.MAX_CREDENTIAL_FILE_BYTES,
  ID_ERROR: dom.ID_ERROR,
  CHOOSE_A_SMALL_CREDENTIALS_JSON_FILE: text.CHOOSE_A_SMALL_CREDENTIALS_JSON_FILE,
  ID_CREDENTIALS: dom.ID_CREDENTIALS,
  COULD_NOT_READ_THE_FILE: text.COULD_NOT_READ_THE_FILE,
  ID_CONNECTION: dom.ID_CONNECTION,
  ACTION_SAVE_PROVIDER: actions.ACTION_SAVE_PROVIDER,
  FIELD_CREDENTIALS: dom.FIELD_CREDENTIALS,
  FIELD_PROJECT: dom.FIELD_PROJECT,
  MODEL_DIMENSION: quota.MODEL_DIMENSION,
  FIELD_SECONDARY_MODEL: dom.FIELD_SECONDARY_MODEL,
  FIELD_QUOTA_METRIC: dom.FIELD_QUOTA_METRIC,
  FIELD_CLIENT_ID: endpoints.FIELD_CLIENT_ID,
  FIELD_CLIENT_SECRET: endpoints.FIELD_CLIENT_SECRET,
  FIELD_URL: endpoints.FIELD_URL,
  FIELD_NAME: dom.FIELD_NAME
};
