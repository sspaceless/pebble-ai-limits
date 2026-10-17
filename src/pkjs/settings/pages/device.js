var C = require('../../resources/settings/pages/device');
var page = require('../page');
var escape = require('../markup').escape;
var copyScript = require('../copy-script');

module.exports = function (pending) {
  return page(
    C.DEVICE_TITLE +
      escape(pending.label || C.DEFAULT_ACCOUNT_LABEL) +
      C.DEVICE_CODE_OPEN +
      escape(pending.userCode) +
      C.DEVICE_CODE_CLOSE +
      C.DEVICE_LOGIN_LINK +
      C.DEVICE_INSTRUCTIONS +
      C.DEVICE_ACTIONS,
    C.ACCOUNT_CONNECTION,
    copyScript
  );
};
