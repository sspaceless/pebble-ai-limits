var C = require('../resources/settings/connection-fields');

/** Draw connection fields without changing draft account state. */
module.exports = function (account, catalog, deviceLogin) {
  var connectionEditor = document.getElementById(C.ID_CONNECTION_EDITOR);
  var provider = account.provider;
  var title = catalog.filter(function (p) {
    return p.id === provider;
  })[0].name;

  document.getElementById(C.ID_CONNECTION_TITLE).textContent =
    (account.configured ? C.UPDATE_CREDENTIALS_FOR : C.CONNECT) +
    title +
    C.ACCOUNT_TITLE_SEPARATOR +
    account.label;

  if (provider === C.PROVIDER_CODEX) {
    document.getElementById(C.ID_CONNECTION_HINT).textContent = C.HINT_CODEX_INLINE;
    document.getElementById(C.ID_CONNECTION_SAVE).hidden = true;
    document.getElementById(C.ID_CONNECTION_FIELDS).innerHTML = C.DEVICE_LOGIN_PANEL;
    document.getElementById(C.ID_START_CODEX_LOGIN).onclick = function () {
      deviceLogin.start(account);
    };

    document.getElementById(C.ID_COPY_CODEX_CODE).onclick = function () {
      var code = document.getElementById(C.ID_DEVICE_CODE);
      var range = document.createRange();

      range.selectNodeContents(code);
      var selection = window.getSelection();

      selection.removeAllRanges();
      selection.addRange(range);

      try {
        document.execCommand(C.CLIPBOARD_COPY_COMMAND);
      } catch (_) {
        /* Ignore unavailable optional data; use the fallback below. */
      }
    };

    document.getElementById(C.ID_CONNECTION_ERROR).textContent = '';
    connectionEditor.scrollIntoView({ behavior: C.SCROLL_BEHAVIOR, block: C.SCROLL_ALIGNMENT });

    return;
  }

  var hints = {
    claude: C.HINT_CLAUDE_INLINE,
    gemini: C.HINT_GEMINI_INLINE,
    'claude-api': C.ENTER_AN_ANTHROPIC_API_KEY_AND_EXACT_MODEL_ID,
    'gemini-api': C.HINT_GEMINI_API_INLINE,
    custom: C.HINT_CUSTOM_INLINE
  };

  document.getElementById(C.ID_CONNECTION_HINT).textContent = hints[provider] || '';

  function input(id, label, required) {
    return (
      C.CONNECTION_LABEL_OPEN +
      id +
      C.ATTRIBUTE_CONTENT_START +
      label +
      C.CONNECTION_INPUT_OPEN +
      id +
      C.AUTOCOMPLETE_OFF +
      (required ? C.REQUIRED_ATTRIBUTE : '') +
      C.ELEMENT_END
    );
  }

  document.getElementById(C.ID_CONNECTION_SAVE).hidden = false;
  var fields =
    C.CONNECTION_CREDENTIALS_LABEL +
    (provider === C.PROVIDER_CLAUDE_API
      ? C.API_KEY
      : provider === C.PROVIDER_CUSTOM
        ? C.BEARER_TOKEN_OPTIONAL
        : C.OAUTH_CREDENTIALS_JSON_OR_ACCESS_TOKEN) +
    C.CONNECTION_CREDENTIALS_INPUT +
    (provider === C.PROVIDER_CUSTOM ? '' : C.REQUIRED_ATTRIBUTE) +
    C.TEXTAREA_CLOSE;

  if (
    provider === C.PROVIDER_CLAUDE_API ||
    provider === C.PROVIDER_GEMINI_CLI ||
    provider === C.PROVIDER_GEMINI_API
  ) {
    fields += input(C.MODEL_DIMENSION, C.MODEL_ID, provider !== C.PROVIDER_GEMINI_CLI);
  }

  if (provider === C.PROVIDER_GEMINI_CLI) {
    fields +=
      input(C.FIELD_SECONDARY_MODEL, C.SECOND_MODEL_ID_OPTIONAL, false) +
      input(C.FIELD_PROJECT, C.CODE_ASSIST_PROJECT_ID_OPTIONAL, false);
  }

  if (provider === C.PROVIDER_GEMINI_API) {
    fields +=
      input(C.FIELD_PROJECT, C.GOOGLE_CLOUD_PROJECT_NUMBER, true) +
      input(C.FIELD_QUOTA_METRIC, C.QUOTA_METRIC_NAME, true);
  }

  if (provider === C.PROVIDER_CUSTOM) {
    fields +=
      input(C.FIELD_URL, C.HTTPS_ENDPOINT, true) + input(C.FIELD_NAME, C.WATCH_DISPLAY_NAME, false);
  }

  if (
    provider === C.PROVIDER_CLAUDE ||
    provider === C.PROVIDER_GEMINI_CLI ||
    provider === C.PROVIDER_GEMINI_API
  ) {
    fields +=
      C.OAUTH_CLIENT_SECTION_OPEN +
      input(C.FIELD_CLIENT_ID, C.CLIENT_ID, false) +
      input(C.FIELD_CLIENT_SECRET, C.CLIENT_SECRET, false) +
      C.DETAILS_CLOSE;
  }

  document.getElementById(C.ID_CONNECTION_FIELDS).innerHTML = fields;
  document.getElementById(C.ID_CONNECTION_ERROR).textContent = '';
  connectionEditor.scrollIntoView({ behavior: C.SCROLL_BEHAVIOR, block: C.SCROLL_ALIGNMENT });
};

module.exports.constants = C;
