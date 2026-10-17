/** Explicit constant dependencies; these alone accompany the browser factory. */
var dom = require('../shared/dom');
var text = require('../shared/text');
var actions = require('../shared/actions');

module.exports = {
  ID_SETTINGS_MESSAGE: dom.ID_SETTINGS_MESSAGE,
  ID_SAVE_SETTINGS: dom.ID_SAVE_SETTINGS,
  CHANGES_READY_TO_SAVE: text.CHANGES_READY_TO_SAVE,
  ACTION_SAVE_SETTINGS: actions.ACTION_SAVE_SETTINGS,
  ACTION_SELECT_ACCOUNT: actions.ACTION_SELECT_ACCOUNT,
  ACTION_REORDER_ACCOUNTS: actions.ACTION_REORDER_ACCOUNTS,
  ACTION_RENAME_ACCOUNT: actions.ACTION_RENAME_ACCOUNT,
  ACTION_DELETE_ACCOUNT: actions.ACTION_DELETE_ACCOUNT,
  ACTION_LOGIN: actions.ACTION_LOGIN,
  FINISH_OR_CANCEL_THE_ACCOUNT_NAME_FIRST: text.FINISH_OR_CANCEL_THE_ACCOUNT_NAME_FIRST
};
