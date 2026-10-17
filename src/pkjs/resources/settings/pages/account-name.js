/** Explicit constant dependencies; these alone accompany the browser factory. */
var markup = require('../../shared/markup');
var text = require('../../shared/text');
var syntax = require('../../shared/syntax');
var actions = require('../../shared/actions');
var dom = require('../../shared/dom');

module.exports = {
  TITLE_OPEN: markup.TITLE_OPEN,
  RENAME_ACCOUNT_TITLE: text.RENAME_ACCOUNT_TITLE,
  ADD: text.ADD,
  DOT: syntax.DOT,
  ACCOUNT_NAME_FORM_OPEN: markup.ACCOUNT_NAME_FORM_OPEN,
  ACCOUNT_NAME_FORM_ACTION: markup.ACCOUNT_NAME_FORM_ACTION,
  SAVE_NAME: text.SAVE_NAME,
  ADD_AND_CONNECT: text.ADD_AND_CONNECT,
  FORM_BUTTON_CLOSE: markup.FORM_BUTTON_CLOSE,
  BACK_LABEL: text.BACK_LABEL,
  ACTION_BACK: actions.ACTION_BACK,
  QUIET_BUTTON_CLASS: dom.QUIET_BUTTON_CLASS,
  ACCOUNT_PROFILE: text.ACCOUNT_PROFILE,
  ACTION_SAVE_NAME: actions.ACTION_SAVE_NAME,
  ACTION_CREATE_ACCOUNT: actions.ACTION_CREATE_ACCOUNT
};
