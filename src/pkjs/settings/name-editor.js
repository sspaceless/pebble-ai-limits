var C = require('../resources/settings/name-editor');

/** Self-contained WebView module; dependencies are passed explicitly. */
module.exports = function (state, draft, order, mark, render, validName) {
  var editor = document.getElementById(C.ID_ACCOUNT_EDITOR);
  var name = document.getElementById(C.ID_EDIT_NAME);

  function edit(account, provider) {
    draft.editing = { account: account, provider: provider };
    editor.hidden = false;
    document.getElementById(C.ID_EDIT_TITLE).textContent = account
      ? C.RENAME_ACCOUNT
      : C.ADD_ACCOUNT;
    name.value = account ? account.label : '';
    name.focus();
    editor.scrollIntoView({ behavior: C.SCROLL_BEHAVIOR, block: C.SCROLL_ALIGNMENT });
  }

  document.getElementById(C.ID_EDIT_FORM).onsubmit = function (event) {
    event.preventDefault();
    var label = name.value.trim();

    if (!validName(label)) {
      document.getElementById(C.ID_EDIT_ERROR).textContent = C.USE_A_NAME_OF_1_16_CHARACTERS;

      return;
    }

    order();

    if (draft.editing.account) {
      draft.editing.account.label = label;
    } else {
      var id =
        C.DRAFT_ACCOUNT_PREFIX +
        Date.now().toString(C.IDENTIFIER_RADIX) +
        C.HYPHEN +
        ++draft.sequence;

      state.accounts.push({
        id: id,
        provider: draft.editing.provider,
        label: label,
        configured: false
      });
      state.selectedId = id;
      draft.connectId = id;
    }

    editor.hidden = true;
    draft.editing = null;
    document.getElementById(C.ID_EDIT_ERROR).textContent = '';
    mark();
    render();
  };

  document.getElementById(C.ID_CANCEL_EDIT).onclick = function () {
    editor.hidden = true;
    draft.editing = null;
  };

  return edit;
};

// Serialized browser factories carry only their own constant dependencies.
module.exports.constants = C;
