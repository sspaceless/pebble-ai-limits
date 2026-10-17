var C = require('../resources/settings/runtime');

/* global closePage: writable -- Installed by the settings page shell. */
/** Self-contained WebView module; dependencies are passed explicitly. */
module.exports = function (state, catalog, icons, modules) {
  var finish = closePage;
  var draft = { editing: null, sequence: 0, connectId: null };
  var message = document.getElementById(C.ID_SETTINGS_MESSAGE);
  var done = document.getElementById(C.ID_SAVE_SETTINGS);
  var list = modules.list(state, catalog, icons);
  var order = list.order;
  var render = list.render;
  var deviceLogin = modules.device(mark, render);
  var edit = modules.name(state, draft, order, mark, render, modules.validName);
  var openConnection = modules.connection(
    state,
    catalog,
    deviceLogin,
    mark,
    render,
    modules.fields,
    modules.validation
  );

  modules.picker(state, draft, order, mark, render, openConnection, modules.validName);
  modules.menus();

  function mark() {
    message.textContent = C.CHANGES_READY_TO_SAVE;
  }

  function save() {
    order();
    finish({
      action: C.ACTION_SAVE_SETTINGS,
      state: {
        selectedId: state.selectedId,
        accounts: state.accounts.map(function (a) {
          return {
            id: a.id,
            provider: a.provider,
            label: a.label,
            connectionData: a.connectionData || null
          };
        })
      }
    });
  }

  closePage = function (data) {
    order();

    if (data.action === C.ACTION_SELECT_ACCOUNT) {
      state.selectedId = data.accountId;
      mark();
      render();
    } else if (data.action === C.ACTION_REORDER_ACCOUNTS) {
      mark();
    } else if (data.action === C.ACTION_RENAME_ACCOUNT) {
      edit(
        state.accounts.filter(function (a) {
          return a.id === data.accountId;
        })[0]
      );
    } else if (data.action === C.ACTION_DELETE_ACCOUNT) {
      state.accounts = state.accounts.filter(function (a) {
        return a.id !== data.accountId;
      });

      if (state.selectedId === data.accountId) {
        state.selectedId = state.accounts.length ? state.accounts[0].id : null;
      }

      if (draft.connectId === data.accountId) {
        draft.connectId = null;
      }

      mark();
      render();
    } else if (data.action === C.ACTION_LOGIN) {
      var target = state.accounts.filter(function (a) {
        return a.id === data.accountId;
      })[0];

      openConnection(target);
    }
  };

  done.onclick = function () {
    if (draft.editing) {
      message.textContent = C.FINISH_OR_CANCEL_THE_ACCOUNT_NAME_FIRST;

      return;
    }

    deviceLogin.stop();
    save();
  };
};

// Serialized browser factories carry only their own constant dependencies.
module.exports.constants = C;
