var C = require('../../resources/settings/pages/account-name');
var serialize = require('../serialize');
var nameForm = require('../name-form-runtime');
var page = require('../page');
var markup = require('../markup');
var catalog = require('../../providers').catalog;

var escape = markup.escape;
var button = markup.button;

module.exports = function (providerId, account) {
  var provider = catalog.filter(function (p) {
    return p.id === providerId;
  })[0];

  return page(
    C.TITLE_OPEN +
      (account ? C.RENAME_ACCOUNT_TITLE : C.ADD + provider.name + C.DOT) +
      C.ACCOUNT_NAME_FORM_OPEN +
      escape(account ? account.label : '') +
      C.ACCOUNT_NAME_FORM_ACTION +
      (account ? C.SAVE_NAME : C.ADD_AND_CONNECT) +
      C.FORM_BUTTON_CLOSE +
      button(C.BACK_LABEL, { action: C.ACTION_BACK }, C.QUIET_BUTTON_CLASS),
    C.ACCOUNT_PROFILE,
    serialize(nameForm, [
      account
        ? { action: C.ACTION_SAVE_NAME, accountId: account.id }
        : { action: C.ACTION_CREATE_ACCOUNT, provider: providerId }
    ])
  );
};
