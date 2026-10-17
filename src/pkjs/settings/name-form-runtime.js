var C = require('../resources/settings/name-form-runtime');

/* global closePage -- Installed by page shell. */
module.exports = function (data) {
  document.getElementById(C.ID_NAME_FORM).onsubmit = function (event) {
    event.preventDefault();
    var label = document.getElementById(C.ID_LABEL).value.trim();

    if (!label) {
      document.getElementById(C.ID_ERROR).textContent = C.ENTER_AN_ACCOUNT_NAME;

      return;
    }

    data.label = label;
    closePage(data);
  };
};

// Serialized browser factories carry only their own constant dependencies.
module.exports.constants = C;
