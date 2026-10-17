var C = require('../resources/settings/credentials-form-runtime');

/* global closePage -- Installed by page shell. */
module.exports = function (provider, accountId) {
  var picker = document.getElementById(C.ID_CREDENTIAL_FILE);

  if (picker) {
    picker.onchange = function () {
      var file = picker.files[0];

      if (!file) {
        return;
      }

      if (file.size > C.MAX_CREDENTIAL_FILE_BYTES) {
        document.getElementById(C.ID_ERROR).textContent = C.CHOOSE_A_SMALL_CREDENTIALS_JSON_FILE;

        return;
      }

      var reader = new FileReader();

      reader.onload = function () {
        document.getElementById(C.ID_CREDENTIALS).value = reader.result;
      };

      reader.onerror = function () {
        document.getElementById(C.ID_ERROR).textContent = C.COULD_NOT_READ_THE_FILE;
      };

      reader.readAsText(file);
    };
  }

  document.getElementById(C.ID_CONNECTION).onsubmit = function (event) {
    event.preventDefault();
    var data = { action: C.ACTION_SAVE_PROVIDER, provider: provider, accountId: accountId };

    [
      C.FIELD_CREDENTIALS,
      C.FIELD_PROJECT,
      C.MODEL_DIMENSION,
      C.FIELD_SECONDARY_MODEL,
      C.FIELD_QUOTA_METRIC,
      C.FIELD_CLIENT_ID,
      C.FIELD_CLIENT_SECRET,
      C.FIELD_URL,
      C.FIELD_NAME
    ].forEach(function (key) {
      var field = document.getElementById(key);

      if (field) {
        data[key] = field.value.trim();
      }
    });
    closePage(data);
  };
};

// Serialized browser factories carry only their own constant dependencies.
module.exports.constants = C;
