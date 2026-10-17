var limits = require('./limits');
var endpoints = require('./endpoints');
var actions = require('./actions');

/** Canonical markup values. */
module.exports = {
  BUTTON_OPEN: '<button type="button" class="',
  BUTTON_ACTION_HANDLER:
    '" onclick="if(this.className.indexOf(\'menu-action\')>=0){var m=this.parentNode&&this.parentNode.parentNode;if(m&&m.open!==undefined)m.open=false;}closePage(',
  BUTTON_ACTION_END: ');">',
  BUTTON_CLOSE: '</button>',
  ACCOUNT_ROW_OPEN: '<li class="order-item" data-account-id="',
  DRAG_HANDLE_OPEN:
    '"><button type="button" class="drag-handle" draggable="false" aria-label="Move ',
  DRAG_HANDLE_CLOSE: '">⠿</button>',
  ACCOUNT_TITLE_OPEN: '<span class="account-title">',
  ACCOUNT_STATUS_OPEN: '</span><span class="account-status">',
  SPAN_CLOSE: '</span>',
  ACCOUNT_MENU_OPEN: '<details class="account-menu"><summary aria-label="Actions for ',
  ACCOUNT_MENU_ACTIONS_OPEN: '">⋯</summary><div class="menu-actions">',
  ACCOUNT_ROW_CLOSE: '</div></details></li>',
  DEVICE_LOGIN_PANEL:
    '<p id="device-login-status" role="status">Start sign-in to get a one-time code.</p><div id="device-code-panel" hidden><label for="device-code">One-time code</label><code id="device-code"></code><button id="copy-codex-code" class="secondary" type="button">Copy code</button><a class="button secondary" href="' +
    endpoints.CODEX_DEVICE_LOGIN_URL +
    '" target="_blank" rel="noopener noreferrer">Open ChatGPT sign-in ↗</a></div><button id="start-codex-login" type="button">Start sign-in</button>',
  CONNECTION_LABEL_OPEN: '<label for="connection-',
  ATTRIBUTE_CONTENT_START: '">',
  CONNECTION_INPUT_OPEN: '</label><input id="connection-',
  ELEMENT_END: '>',
  CONNECTION_CREDENTIALS_LABEL: '<label for="connection-credentials">',
  CONNECTION_CREDENTIALS_INPUT:
    '</label><textarea id="connection-credentials" rows="5" autocomplete="off" autocapitalize="off" spellcheck="false" ',
  TEXTAREA_CLOSE: '></textarea>',
  OAUTH_CLIENT_SECTION_OPEN: '<details><summary>OAuth client (optional)</summary>',
  DETAILS_CLOSE: '</details>',
  BRAND_HEADER_OPEN: '<header class="brand"><span class="mark codex-brand" aria-hidden="true">',
  BRAND_HEADER_CLOSE:
    '</span><span class="wordmark">ai limits</span></header><div class="eyebrow">',
  DIV_CLOSE: '</div>',
  PAGE_SCRIPT_OPEN: '<footer class="footer">AI LIMITS / PEBBLE</footer></main><script>',
  DOCUMENT_END: '</script></body></html>',
  TITLE_OPEN: '<h1>',
  ACCOUNT_NAME_FORM_OPEN:
    '</h1><p>Give this account a short name to identify it on your watch.</p><form id="name-form"><label for="label">Account name</label><input id="label" required maxlength="' +
    limits.ACCOUNT_NAME_MAX_LENGTH +
    '" autocomplete="off" placeholder="Personal or Work" value="',
  ACCOUNT_NAME_FORM_ACTION: '"><p id="error" role="alert"></p><button>',
  FORM_BUTTON_CLOSE: '</button></form>',
  LABEL_OPEN: '<label for="',
  INPUT_OPEN: '</label><input id="',
  INPUT_AUTOCOMPLETE_END: 'autocomplete="off">',
  CREDENTIALS_LABEL: '<label for="credentials">',
  CREDENTIALS_INPUT:
    '</label><textarea id="credentials" rows="5" autocomplete="off" autocapitalize="off" spellcheck="false" ',
  CREDENTIAL_FILE_INPUT:
    '<label for="credential-file">Import credentials file (optional)</label><input id="credential-file" type="file" accept=".json,application/json">',
  CONNECTION_TITLE_OPEN: '<h1>Connect ',
  ACCOUNT_CAPTION_OPEN: '.</h1><p class="account-caption">',
  PARAGRAPH_BOUNDARY: '</p><p>',
  CONNECTION_FORM_OPEN: '</p><form id="connection">',
  CONNECTION_FORM_FOOTER:
    '<p id="error" role="alert"></p><button type="submit">Save connection</button></form><button class="quiet" onclick="closePage({action:\'' +
    actions.ACTION_BACK +
    '\'})">Back</button><p class="note">Credentials stay in the Pebble companion on your phone. The app only reads usage metadata and never generates model responses.</p>',
  DEVICE_TITLE: '<h1>Connect your account.</h1><p class="account-caption">',
  DEVICE_CODE_OPEN:
    '</p><p>Use this code to finish signing in with ChatGPT.</p><button type="button" class="code-box" onclick="copyCode()" aria-label="Copy one-time code"><span class="code-label">Your one-time code</span><code id="device-code">',
  DEVICE_CODE_CLOSE:
    '</code><span id="copy-status" class="copy-control" role="status" aria-live="polite">Copy code</span></button>',
  DEVICE_LOGIN_LINK:
    '<a class="button secondary" href="' +
    endpoints.CODEX_DEVICE_LOGIN_URL +
    '" target="_blank" rel="noopener noreferrer">Open ChatGPT sign-in ↗</a>',
  DEVICE_INSTRUCTIONS:
    '<ol class="steps"><li><strong>Enter the code</strong> on the OpenAI page.</li><li><strong>Approve the sign-in</strong>, then return to Pebble.</li></ol>',
  DEVICE_ACTIONS:
    '<button onclick="closePage({action:\'' +
    actions.ACTION_FINISH_LOGIN +
    '\'})">I have approved the sign-in</button><button class="quiet" onclick="closePage({action:\'' +
    actions.ACTION_CANCEL_LOGIN +
    '\'})">Cancel</button><p class="note">Check that you are signed into the intended ChatGPT account before approval. The code expires after ' +
    limits.DEVICE_CODE_TTL_MINUTES +
    ' minutes. If the link does not open, visit auth.openai.com/codex/device in Safari.</p>',
  ADD_ACCOUNT_OPEN:
    '<details class="add-account"><summary class="button secondary">+ Add account</summary><form id="add-account-form"><label>Connection type</label><div id="provider-dropdown" class="provider-dropdown"><button id="provider-toggle" class="provider-toggle" type="button" aria-haspopup="listbox" aria-expanded="false"><span id="provider-choice">Choose a provider</span><span aria-hidden="true">⌄</span></button><div id="provider-options" class="provider-options" role="listbox" hidden>',
  PROVIDER_OPTION_OPEN:
    '<button type="button" class="provider-option" role="option" data-provider="',
  ADD_ACCOUNT_CLOSE:
    '</div></div><input id="provider-type" type="hidden"><label for="add-name">Account name</label><input id="add-name" maxlength="' +
    limits.ACCOUNT_NAME_MAX_LENGTH +
    '" autocomplete="off" placeholder="Personal or Work"><p id="add-error" role="alert"></p><button type="submit">Add account</button></form></details>',
  NAME_EDITOR:
    '<section id="account-editor" class="editor" hidden><h2 id="edit-title">Account name</h2><form id="edit-form"><label for="edit-name">Account name</label><input id="edit-name" required maxlength="' +
    limits.ACCOUNT_NAME_MAX_LENGTH +
    '" autocomplete="off" placeholder="Personal or Work"><p id="edit-error" role="alert"></p><button type="submit">Apply name</button><button id="cancel-edit" class="quiet" type="button">Cancel</button></form></section>',
  CONNECTION_EDITOR:
    '<section id="connection-editor" class="editor" hidden><h2 id="connection-title">Connect account</h2><p id="connection-hint" class="note"></p><form id="connection-form"><div id="connection-fields"></div><p id="connection-error" role="alert"></p><button id="connection-save" type="submit">Save connection</button><button id="cancel-connection" class="quiet" type="button">Cancel</button></form></section>',
  ACCOUNT_LIST_OPEN:
    '<h1>Accounts.</h1><p>Drag to reorder. Save when you’re done.</p><ul id="watch-order" class="order-list">',
  ACCOUNT_LIST_CLOSE:
    '</ul><p id="empty-accounts" class="note" hidden>Add an account to get started.</p><button id="save-order" class="secondary" type="button" hidden disabled>Save order</button><div id="order-message" class="order-message" role="status" aria-live="polite"></div>',
  SETTINGS_SAVE:
    '<p id="settings-message" class="note" role="status" aria-live="polite">Changes apply when you save.</p><button id="save-settings" type="button" style="margin-top:16px">Save and close</button>',
  ATTRIBUTE_VALUE_END: '" ',
  DOCUMENT_START:
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI Limits</title><style>',
  DOCUMENT_BODY_START: '</style></head><body><main>',
  HTML_AMPERSAND: '&amp;',
  HTML_LESS_THAN: '&lt;',
  HTML_GREATER_THAN: '&gt;',
  HTML_QUOTE: '&quot;'
};
