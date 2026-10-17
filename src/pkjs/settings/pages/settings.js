var C = require('../../resources/settings/pages/settings');
var page = require('../page');
var markup = require('../markup');
var catalog = require('../../providers').catalog;
var providerIcons = require('../../provider-icons');
var orderScript = require('../order-script');

var escape = markup.escape;
var button = markup.button;
var buttonHtml = markup.buttonHtml;

var providerIcon = providerIcons.providerIcon;

module.exports = function (state) {
  var rows = state.accounts
    .map(function (a) {
      var p = catalog.filter(function (candidate) {
        return candidate.id === a.provider;
      })[0];
      var selected = a.id === state.selectedId;
      var title = p.name + C.ACCOUNT_TITLE_SEPARATOR + escape(a.label);
      var connection =
        a.provider === C.PROVIDER_CODEX
          ? a.configured
            ? C.RECONNECT_CHAT_GPT
            : C.SIGN_IN_WITH_CHAT_GPT
          : a.configured
            ? C.UPDATE_CREDENTIALS
            : C.CONNECT + p.name;

      return (
        C.ACCOUNT_ROW_OPEN +
        escape(a.id) +
        C.DRAG_HANDLE_OPEN +
        p.name +
        C.SPACE +
        escape(a.label) +
        C.DRAG_HANDLE_CLOSE +
        buttonHtml(
          C.ACCOUNT_TITLE_OPEN +
            providerIcon(a.provider) +
            title +
            C.ACCOUNT_STATUS_OPEN +
            (a.configured ? C.ACCOUNT_CONNECTED_LABEL : C.NOT_CONNECTED) +
            (selected ? C.SELECTED : '') +
            C.SPAN_CLOSE,
          { action: C.ACTION_SELECT_ACCOUNT, accountId: a.id },
          C.ACCOUNT_SELECT_CLASS
        ) +
        C.ACCOUNT_MENU_OPEN +
        title +
        C.ACCOUNT_MENU_ACTIONS_OPEN +
        button(connection, { action: C.ACTION_LOGIN, accountId: a.id }, C.MENU_ACTION_CLASS) +
        button(
          C.RENAME_LABEL,
          { action: C.ACTION_RENAME_ACCOUNT, accountId: a.id },
          C.MENU_ACTION_CLASS
        ) +
        button(
          C.REMOVE_LABEL,
          { action: C.ACTION_DELETE_ACCOUNT, accountId: a.id },
          C.MENU_ACTION_DESTRUCTIVE
        ) +
        C.ACCOUNT_ROW_CLOSE
      );
    })
    .join('');
  var add =
    C.ADD_ACCOUNT_OPEN +
    catalog
      .map(function (p) {
        return (
          C.PROVIDER_OPTION_OPEN +
          p.id +
          C.ATTRIBUTE_CONTENT_START +
          providerIcon(p.id) +
          escape(p.name) +
          C.BUTTON_CLOSE
        );
      })
      .join('') +
    C.ADD_ACCOUNT_CLOSE;
  var editor = C.NAME_EDITOR;
  var connectionEditor = C.CONNECTION_EDITOR;
  var icons = {};

  catalog.forEach(function (p) {
    icons[p.id] = providerIcon(p.id);
  });

  return page(
    C.ACCOUNT_LIST_OPEN +
      rows +
      C.ACCOUNT_LIST_CLOSE +
      add +
      editor +
      connectionEditor +
      C.SETTINGS_SAVE,
    C.SETTINGS_SUBTITLE,
    orderScript + require('../accounts-ui').script(state, catalog, icons)
  );
};
