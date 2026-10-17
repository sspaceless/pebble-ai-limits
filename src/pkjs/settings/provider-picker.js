var C = require('../resources/settings/provider-picker');

/** Self-contained WebView module; dependencies are passed explicitly. */
module.exports = function (state, draft, order, mark, render, openConnection, validName) {
  var providerField = document.getElementById(C.ID_PROVIDER_TYPE);
  var accountNameField = document.getElementById(C.ID_ADD_NAME);
  var addError = document.getElementById(C.ID_ADD_ERROR);
  var providerToggle = document.getElementById(C.ID_PROVIDER_TOGGLE);
  var providerOptions = document.getElementById(C.ID_PROVIDER_OPTIONS);
  var providerDropdown = document.getElementById(C.ID_PROVIDER_DROPDOWN);

  function clearAddError() {
    addError.textContent = '';
  }

  providerToggle.onclick = function () {
    var open = providerOptions.hidden;

    providerOptions.hidden = !open;
    providerToggle.setAttribute(C.ATTRIBUTE_ARIA_EXPANDED, String(open));
  };

  providerOptions.querySelectorAll(C.SELECTOR_PROVIDER_OPTION).forEach(function (option) {
    option.onclick = function () {
      providerField.value = option.getAttribute(C.ATTRIBUTE_DATA_PROVIDER);
      document.getElementById(C.ID_PROVIDER_CHOICE).textContent = option.textContent.trim();
      providerOptions.querySelectorAll(C.SELECTOR_PROVIDER_OPTION).forEach(function (other) {
        other.setAttribute(C.ATTRIBUTE_ARIA_SELECTED, String(other === option));
      });
      providerOptions.hidden = true;
      providerToggle.setAttribute(C.ATTRIBUTE_ARIA_EXPANDED, C.FALSE_ATTRIBUTE_VALUE);
      clearAddError();
    };
  });
  document.addEventListener(C.EVENT_CLICK, function (event) {
    if (!providerDropdown.contains(event.target)) {
      providerOptions.hidden = true;
      providerToggle.setAttribute(C.ATTRIBUTE_ARIA_EXPANDED, C.FALSE_ATTRIBUTE_VALUE);
    }
  });
  document.addEventListener(C.EVENT_KEYDOWN, function (event) {
    if (event.key === C.EVENT_ESCAPE) {
      providerOptions.hidden = true;
      providerToggle.setAttribute(C.ATTRIBUTE_ARIA_EXPANDED, C.FALSE_ATTRIBUTE_VALUE);
    }
  });
  accountNameField.addEventListener(C.EVENT_INPUT, clearAddError);
  document.getElementById(C.ID_ADD_ACCOUNT_FORM).onsubmit = function (event) {
    event.preventDefault();
    var provider = providerField.value;
    var label = accountNameField.value.trim();

    if (!provider) {
      addError.textContent = C.CHOOSE_A_CONNECTION_TYPE;
      providerField.focus();

      return;
    }

    if (!validName(label)) {
      addError.textContent = C.ENTER_AN_ACCOUNT_NAME_OF_1_16_CHARACTERS;
      accountNameField.focus();

      return;
    }

    order();
    var id =
      C.DRAFT_ACCOUNT_PREFIX +
      Date.now().toString(C.IDENTIFIER_RADIX) +
      C.HYPHEN +
      ++draft.sequence;
    var account = { id: id, provider: provider, label: label, configured: false };

    state.accounts.push(account);
    state.selectedId = id;
    document.querySelector(C.SELECTOR_ADD_ACCOUNT).open = false;
    mark();
    render();

    if (provider !== C.PROVIDER_CODEX) {
      openConnection(account);
    }
  };
};

// Serialized browser factories carry only their own constant dependencies.
module.exports.constants = C;
