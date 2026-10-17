var C = require('../resources/settings/close-runtime');

/* global closePage: writable -- Browser page bridge, created before other modules run. */
module.exports = function () {
  closePage = function (data) {
    location.href = C.SETTINGS_CLOSE_URL_PREFIX + encodeURIComponent(JSON.stringify(data));
  };

  return closePage;
};

// Serialized browser factories carry only their own constant dependencies.
module.exports.constants = C;
