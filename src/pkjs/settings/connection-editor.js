var C = require('../resources/settings/connection-editor');

/** Self-contained WebView module; dependencies are passed explicitly. */
module.exports = function (
  state,
  catalog,
  deviceLogin,
  mark,
  render,
  drawConnection,
  validateConnection
) {
  var connectionAccountId = null;
  var connectionOriginal = null;
  var connectionEditor = document.getElementById(C.ID_CONNECTION_EDITOR);

  function restoreConnectionDraft() {
    var account = state.accounts.filter(function (a) {
      return a.id === connectionAccountId;
    })[0];

    if (account && connectionOriginal) {
      account.configured = connectionOriginal.configured;

      if (connectionOriginal.connectionData) {
        account.connectionData = connectionOriginal.connectionData;
      } else {
        delete account.connectionData;
      }
    }
  }

  function openConnection(account) {
    if (connectionAccountId && connectionAccountId !== account.id) {
      deviceLogin.stop();
      restoreConnectionDraft();
    }

    connectionAccountId = account.id;
    connectionOriginal = {
      configured: account.configured,
      connectionData: account.connectionData
    };
    connectionEditor.hidden = false;
    drawConnection(account, catalog, deviceLogin);
  }

  document.getElementById(C.ID_CANCEL_CONNECTION).onclick = function () {
    deviceLogin.stop();
    restoreConnectionDraft();

    connectionEditor.hidden = true;
    connectionAccountId = null;
    connectionOriginal = null;
    document.getElementById(C.ID_CONNECTION_ERROR).textContent = '';
    render();
  };

  document.getElementById(C.ID_CONNECTION_FORM).onsubmit = function (event) {
    event.preventDefault();
    var account = state.accounts.filter(function (a) {
      return a.id === connectionAccountId;
    })[0];

    if (!account) {
      return;
    }

    var data = {};

    [
      C.FIELD_CREDENTIALS,
      C.MODEL_DIMENSION,
      C.FIELD_SECONDARY_MODEL,
      C.FIELD_PROJECT,
      C.FIELD_QUOTA_METRIC,
      C.FIELD_CLIENT_ID,
      C.FIELD_CLIENT_SECRET,
      C.FIELD_URL,
      C.FIELD_NAME
    ].forEach(function (key) {
      var field = document.getElementById(C.CONNECTION_FIELD_ID_PREFIX + key);

      if (field) {
        data[key] = field.value.trim();
      }
    });
    var error = validateConnection(account.provider, data);

    if (error) {
      document.getElementById(C.ID_CONNECTION_ERROR).textContent = error;

      return;
    }

    account.connectionData = data;
    account.configured = true;
    connectionEditor.hidden = true;
    connectionAccountId = null;
    connectionOriginal = null;
    mark();
    render();
  };

  return openConnection;
};

// Serialized browser factories carry only their own constant dependencies.
module.exports.constants = C;
