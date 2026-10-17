var C = require('../../resources/settings/pages/credentials');
var serialize = require('../serialize');
var credentialsForm = require('../credentials-form-runtime');
var page = require('../page');
var markup = require('../markup');
var catalog = require('../../providers').catalog;

var escape = markup.escape;

module.exports = function (id, profile) {
  var account = profile || { id: '', label: C.DEFAULT_ACCOUNT_LABEL };
  var selected = catalog.filter(function (p) {
    return p.id === id;
  })[0];
  var hints = {
    claude: C.HINT_CLAUDE,
    gemini: C.HINT_GEMINI,
    'claude-api':
      C.ENTER_AN_ANTHROPIC_KEY_WITH_ACCESS_TO_THE_ORGANIZATION_RATE_LIMITS_API_AND_AN_EXACT_M,
    'gemini-api': C.HINT_GEMINI_API,
    custom: C.HINT_CUSTOM
  };

  function input(name, label, required) {
    return (
      C.LABEL_OPEN +
      name +
      C.ATTRIBUTE_CONTENT_START +
      label +
      C.INPUT_OPEN +
      name +
      C.NAME +
      name +
      C.ATTRIBUTE_VALUE_END +
      (required ? C.REQUIRED : '') +
      C.INPUT_AUTOCOMPLETE_END
    );
  }

  var fields =
    C.CREDENTIALS_LABEL +
    (id === C.PROVIDER_CLAUDE_API
      ? C.API_KEY
      : id === C.PROVIDER_CUSTOM
        ? C.BEARER_TOKEN_OPTIONAL
        : C.OAUTH_CREDENTIALS_JSON_OR_ACCESS_TOKEN) +
    C.CREDENTIALS_INPUT +
    (id === C.PROVIDER_CUSTOM ? '' : C.REQUIRED_ATTRIBUTE) +
    C.TEXTAREA_CLOSE;

  if (id === C.PROVIDER_CLAUDE || id === C.PROVIDER_GEMINI_CLI || id === C.PROVIDER_GEMINI_API) {
    fields += C.CREDENTIAL_FILE_INPUT;
  }

  if (
    id === C.PROVIDER_CLAUDE_API ||
    id === C.PROVIDER_GEMINI_CLI ||
    id === C.PROVIDER_GEMINI_API
  ) {
    fields += input(C.MODEL_DIMENSION, C.MODEL_ID, id !== C.PROVIDER_GEMINI_CLI);
  }

  if (id === C.PROVIDER_GEMINI_CLI) {
    fields +=
      input(C.FIELD_SECONDARY_MODEL, C.SECOND_MODEL_ID, false) +
      input(C.FIELD_PROJECT, C.CODE_ASSIST_PROJECT_ID_OPTIONAL, false);
  }

  if (id === C.PROVIDER_GEMINI_API) {
    fields +=
      input(C.FIELD_PROJECT, C.GOOGLE_CLOUD_PROJECT_NUMBER, true) +
      input(C.FIELD_QUOTA_METRIC, C.QUOTA_METRIC_NAME, true);
  }

  if (id === C.PROVIDER_CUSTOM) {
    fields +=
      input(C.FIELD_URL, C.HTTPS_ENDPOINT, true) + input(C.FIELD_NAME, C.WATCH_DISPLAY_NAME, false);
  }

  if (id === C.PROVIDER_CLAUDE || id === C.PROVIDER_GEMINI_CLI || id === C.PROVIDER_GEMINI_API) {
    fields +=
      C.OAUTH_CLIENT_SECTION_OPEN +
      input(C.FIELD_CLIENT_ID, C.CLIENT_ID, false) +
      input(C.FIELD_CLIENT_SECRET, C.CLIENT_SECRET, false) +
      C.DETAILS_CLOSE;
  }

  return page(
    C.CONNECTION_TITLE_OPEN +
      selected.name +
      C.ACCOUNT_CAPTION_OPEN +
      escape(account.label) +
      C.PARAGRAPH_BOUNDARY +
      hints[id] +
      C.CONNECTION_FORM_OPEN +
      fields +
      C.CONNECTION_FORM_FOOTER,
    C.ACCOUNT_CONNECTION,
    serialize(credentialsForm, [id, account.id])
  );
};
