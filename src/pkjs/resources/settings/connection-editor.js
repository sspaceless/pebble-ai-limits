/** Explicit constant dependencies; these alone accompany the browser factory. */
var dom = require('../shared/dom');
var quota = require('../shared/quota');
var endpoints = require('../shared/endpoints');

module.exports = {
  ID_CONNECTION_EDITOR: dom.ID_CONNECTION_EDITOR,
  ID_CANCEL_CONNECTION: dom.ID_CANCEL_CONNECTION,
  ID_CONNECTION_ERROR: dom.ID_CONNECTION_ERROR,
  ID_CONNECTION_FORM: dom.ID_CONNECTION_FORM,
  FIELD_CREDENTIALS: dom.FIELD_CREDENTIALS,
  MODEL_DIMENSION: quota.MODEL_DIMENSION,
  FIELD_SECONDARY_MODEL: dom.FIELD_SECONDARY_MODEL,
  FIELD_PROJECT: dom.FIELD_PROJECT,
  FIELD_QUOTA_METRIC: dom.FIELD_QUOTA_METRIC,
  FIELD_CLIENT_ID: endpoints.FIELD_CLIENT_ID,
  FIELD_CLIENT_SECRET: endpoints.FIELD_CLIENT_SECRET,
  FIELD_URL: endpoints.FIELD_URL,
  FIELD_NAME: dom.FIELD_NAME,
  CONNECTION_FIELD_ID_PREFIX: dom.CONNECTION_FIELD_ID_PREFIX
};
