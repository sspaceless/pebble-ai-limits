var C = require('../resources/settings/account-list');

/** Self-contained WebView module; dependencies are passed explicitly. */
module.exports = function (state, catalog, icons) {
  var list = document.getElementById(C.ID_WATCH_ORDER);
  var done = document.getElementById(C.ID_SAVE_SETTINGS);

  function escape(value) {
    return String(value)
      .replace(new RegExp(C.HTML_AMPERSAND_PATTERN, C.REGEX_GLOBAL), C.HTML_AMPERSAND)
      .replace(new RegExp(C.HTML_LESS_THAN_PATTERN, C.REGEX_GLOBAL), C.HTML_LESS_THAN)
      .replace(new RegExp(C.HTML_GREATER_THAN_PATTERN, C.REGEX_GLOBAL), C.HTML_GREATER_THAN)
      .replace(new RegExp(C.HTML_QUOTE_PATTERN, C.REGEX_GLOBAL), C.HTML_QUOTE);
  }

  function action(label, data, classes) {
    return (
      C.BUTTON_OPEN +
      classes +
      C.BUTTON_ACTION_HANDLER +
      escape(JSON.stringify(data)) +
      C.BUTTON_ACTION_END +
      label +
      C.BUTTON_CLOSE
    );
  }

  function order() {
    var ids = Array.prototype.map.call(list.children, function (row) {
      return row.getAttribute(C.ATTRIBUTE_DATA_ACCOUNT_ID);
    });

    state.accounts = ids.map(function (id) {
      return state.accounts.filter(function (a) {
        return a.id === id;
      })[0];
    });
  }

  function render() {
    list.innerHTML = state.accounts
      .map(function (a) {
        var provider = catalog.filter(function (p) {
          return p.id === a.provider;
        })[0];
        var title = provider.name + C.ACCOUNT_TITLE_SEPARATOR + escape(a.label);
        var connection =
          a.provider === C.PROVIDER_CODEX
            ? a.configured
              ? C.RECONNECT_CHAT_GPT
              : C.SIGN_IN_WITH_CHAT_GPT
            : a.configured
              ? C.UPDATE_CREDENTIALS
              : C.CONNECT + provider.name;

        return (
          C.ACCOUNT_ROW_OPEN +
          escape(a.id) +
          C.DRAG_HANDLE_OPEN +
          title +
          C.DRAG_HANDLE_CLOSE +
          action(
            C.ACCOUNT_TITLE_OPEN +
              icons[a.provider] +
              title +
              C.ACCOUNT_STATUS_OPEN +
              (a.configured ? C.ACCOUNT_CONNECTED_LABEL : C.NOT_CONNECTED) +
              (a.id === state.selectedId ? C.SELECTED : '') +
              C.SPAN_CLOSE,
            { action: C.ACTION_SELECT_ACCOUNT, accountId: a.id },
            C.ACCOUNT_SELECT_CLASS
          ) +
          C.ACCOUNT_MENU_OPEN +
          title +
          C.ACCOUNT_MENU_ACTIONS_OPEN +
          action(connection, { action: C.ACTION_LOGIN, accountId: a.id }, C.MENU_ACTION_CLASS) +
          action(
            C.RENAME_LABEL,
            { action: C.ACTION_RENAME_ACCOUNT, accountId: a.id },
            C.MENU_ACTION_CLASS
          ) +
          action(
            C.REMOVE_LABEL,
            { action: C.ACTION_DELETE_ACCOUNT, accountId: a.id },
            C.MENU_ACTION_DESTRUCTIVE
          ) +
          C.ACCOUNT_ROW_CLOSE
        );
      })
      .join('');
    document.getElementById(C.ID_EMPTY_ACCOUNTS).hidden = !!state.accounts.length;
    done.textContent = C.SAVE_AND_CLOSE;
  }

  return { order: order, render: render };
};

// Serialized browser factories carry only their own constant dependencies.
module.exports.constants = C;
