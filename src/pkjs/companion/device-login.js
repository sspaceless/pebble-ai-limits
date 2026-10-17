var C = require('../resources/companion/device-login');
var direct = require('../providers/codex');
var accounts = require('../accounts');
var pages = require('../config');
var messages = require('./watch-messages');

var statusFor = messages.statusFor;
var errorStatus = messages.errorStatus;
var PENDING = C.PENDING_LOGIN_KEY;

/** Coordinate a persisted, account-bound login.
 * @param {Function} openPage Opens generated configuration HTML.
 * @param {Function} refresh Called when the selected account finishes connecting.
 * @returns {Object} Pending-login lookup, start, poll, and cancellation operations.
 */
module.exports = function (openPage, refresh) {
  var loginBusy = false;
  var loginGeneration = 0;
  var loginTimer = null;

  function read(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (_) {
      return null;
    }
  }

  function pendingLogin() {
    var pending = read(PENDING);

    if (pending && !pending.profileId) {
      var target = accounts.ensure(C.PROVIDER_CODEX);

      pending.profileId = target.id;
      pending.revision = target.revision;
      localStorage.setItem(PENDING, JSON.stringify(pending));
    }

    return pending;
  }

  function cancelPending() {
    loginGeneration++;
    direct.cancel(C.LOGIN_REQUEST_GROUP);
    loginBusy = false;

    if (loginTimer) {
      clearTimeout(loginTimer);
    }

    loginTimer = null;
    localStorage.removeItem(PENDING);
  }

  function beginLogin() {
    var target = accounts.current();

    if (target.provider !== C.PROVIDER_CODEX) {
      openPage(pages.credentials(target.provider, { id: target.id, label: target.label }));

      return;
    }

    cancelPending();
    var generation = loginGeneration;

    loginBusy = true;
    statusFor(target.id, C.STARTING_LOGIN);
    direct.beginLogin(function (error, pending) {
      if (generation !== loginGeneration) {
        return;
      }

      loginBusy = false;
      var latest = accounts.get(target.id);

      if (!latest || latest.revision !== target.revision) {
        return;
      }

      if (error) {
        statusFor(target.id, errorStatus(error, C.PROVIDER_CODEX, true));

        return;
      }

      pending.profileId = target.id;
      pending.revision = target.revision;
      localStorage.setItem(PENDING, JSON.stringify(pending));
      statusFor(target.id, C.APPROVE_LOGIN_ON_PHONE);
      pending.label = latest.label;
      openPage(pages.device(pending));
    });
  }

  function completeLogin() {
    if (loginBusy || loginTimer) {
      return;
    }

    var pending = pendingLogin();

    if (!pending) {
      return;
    }

    var target = accounts.get(pending.profileId);

    if (!target || target.revision !== pending.revision) {
      cancelPending();

      return;
    }

    if (pending.expiresAt <= Date.now()) {
      cancelPending();
      statusFor(target.id, C.LOGIN_CODE_EXPIRED);

      return;
    }

    loginBusy = true;
    var generation = loginGeneration;

    direct.pollLogin(pending, function (error, config) {
      if (generation !== loginGeneration) {
        return;
      }

      loginBusy = false;
      var latest = accounts.get(target.id);

      if (!latest || latest.revision !== pending.revision) {
        cancelPending();

        return;
      }

      if (error) {
        if (error.pending) {
          statusFor(target.id, C.WAITING_FOR_APPROVAL);
          loginTimer = setTimeout(function () {
            loginTimer = null;
            completeLogin();
          }, pending.interval * C.MILLISECONDS_PER_SECOND);
        } else {
          if (
            error.invalidData ||
            (error.status >= C.HTTP_BAD_REQUEST &&
              error.status < C.HTTP_SERVER_ERROR &&
              error.status !== C.HTTP_RATE_LIMITED)
          ) {
            cancelPending();
          }

          statusFor(target.id, errorStatus(error, C.PROVIDER_CODEX, true));
        }

        return;
      }

      accounts.save(target.id, config, pending.revision, true);
      cancelPending();

      if (accounts.current().id === target.id) {
        refresh();
      }
    });
  }

  return {
    pending: pendingLogin,
    begin: beginLogin,
    complete: completeLogin,
    cancel: cancelPending
  };
};
