var C = require('../resources/companion/settings-actions');
var pages = require('../config');
var providers = require('../providers');
var accounts = require('../accounts');
var messages = require('./watch-messages');

var status = messages.status;
var statusFor = messages.statusFor;

/** Bind settings commands to navigation while repository commits remain atomic. */
module.exports = function (login, choose, refresh, openPage, showSettings) {
  return function (event) {
    if (!event.response || event.response === C.SETTINGS_CANCELLED) {
      return;
    }

    try {
      var value = JSON.parse(decodeURIComponent(event.response));
      var target;
      var pending;

      if (value.action === C.ACTION_SAVE_SETTINGS) {
        var connectId = accounts.applySettings(value.state, value.connectAccountId);

        pending = login.pending();

        if (pending && !accounts.get(pending.profileId)) {
          login.cancel();
        }

        if (connectId) {
          choose(connectId);
          login.begin();
        } else {
          choose(accounts.current().id);
          refresh();
        }

        return;
      }

      if (value.action === C.ACTION_SELECT_ACCOUNT) {
        choose(value.accountId);
        showSettings();
        refresh();

        return;
      }

      if (value.action === C.ACTION_SELECT_PROVIDER) {
        choose(accounts.ensure(value.provider).id);
        showSettings();
        refresh();

        return;
      }

      if (value.action === C.ACTION_ADD_ACCOUNT) {
        openPage(pages.accountName(value.provider));

        return;
      }

      if (value.action === C.ACTION_CREATE_ACCOUNT) {
        target = accounts.add(value.provider, value.label);
        choose(target.id);
        login.begin();

        return;
      }

      if (value.action === C.ACTION_RENAME_ACCOUNT) {
        target = accounts.get(value.accountId || accounts.current().id);

        if (!target) {
          throw new Error();
        }

        openPage(pages.accountName(target.provider, { id: target.id, label: target.label }));

        return;
      }

      if (value.action === C.ACTION_SAVE_NAME) {
        accounts.rename(value.accountId, value.label);
        choose(value.accountId, false);
        showSettings();

        return;
      }

      if (value.action === C.ACTION_SAVE_PROVIDER) {
        target = value.accountId ? accounts.get(value.accountId) : accounts.ensure(value.provider);

        if (!target || target.provider !== value.provider) {
          throw new Error(C.ERROR_ACCOUNT_MISMATCH);
        }

        var config = providers.parseConfig(value.provider, value);

        accounts.save(target.id, config);
        choose(target.id);
        refresh();

        return;
      }

      if (value.action === C.ACTION_DELETE_ACCOUNT || value.action === C.ACTION_LOGOUT) {
        var id = value.accountId || accounts.current().id;

        pending = login.pending();

        if (pending && pending.profileId === id) {
          login.cancel();
        }

        accounts.remove(id);
        choose(accounts.current().id);
        showSettings();
        refresh();

        return;
      }

      if (value.action === C.ACTION_REORDER_ACCOUNTS) {
        accounts.reorder(value.accountIds);
        showSettings();

        return;
      }

      if (value.action === C.ACTION_BACK) {
        showSettings();

        return;
      }

      if (value.action === C.ACTION_LOGIN) {
        if (value.accountId) {
          choose(value.accountId);
        }

        login.begin();

        return;
      }

      if (value.action === C.ACTION_FINISH_LOGIN) {
        pending = login.pending();

        if (pending) {
          choose(pending.profileId);
        }

        login.complete();

        return;
      }

      if (value.action === C.ACTION_CANCEL_LOGIN) {
        pending = login.pending();
        login.cancel();

        if (pending) {
          statusFor(pending.profileId, C.LOGIN_CANCELLED);
        }

        showSettings();

        return;
      }

      throw new Error(C.ERROR_UNKNOWN_ACTION);
    } catch (_) {
      status(C.INVALID_SETTINGS);
    }
  };
};
