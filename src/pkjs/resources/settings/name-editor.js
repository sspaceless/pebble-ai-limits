/** Explicit constant dependencies; these alone accompany the browser factory. */
var dom = require('../shared/dom');
var text = require('../shared/text');
var storage = require('../shared/storage');
var limits = require('../shared/limits');
var syntax = require('../shared/syntax');

module.exports = {
  ID_ACCOUNT_EDITOR: dom.ID_ACCOUNT_EDITOR,
  ID_EDIT_NAME: dom.ID_EDIT_NAME,
  ID_EDIT_TITLE: dom.ID_EDIT_TITLE,
  RENAME_ACCOUNT: text.RENAME_ACCOUNT,
  ADD_ACCOUNT: text.ADD_ACCOUNT,
  SCROLL_BEHAVIOR: dom.SCROLL_BEHAVIOR,
  SCROLL_ALIGNMENT: dom.SCROLL_ALIGNMENT,
  ID_EDIT_FORM: dom.ID_EDIT_FORM,
  ID_EDIT_ERROR: dom.ID_EDIT_ERROR,
  USE_A_NAME_OF_1_16_CHARACTERS: text.USE_A_NAME_OF_1_16_CHARACTERS,
  DRAFT_ACCOUNT_PREFIX: storage.DRAFT_ACCOUNT_PREFIX,
  IDENTIFIER_RADIX: limits.IDENTIFIER_RADIX,
  HYPHEN: syntax.HYPHEN,
  ID_CANCEL_EDIT: dom.ID_CANCEL_EDIT
};
