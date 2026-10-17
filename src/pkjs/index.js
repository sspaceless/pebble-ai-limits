var C = require('./resources/index');
/* Entry point: route Pebble events and settings actions to account-bound modules. */
var pages = require('./config');
var accounts = require('./accounts');
var messages = require('./companion/watch-messages');
var refreshAccount = require('./companion/refresh');

var login = require('./companion/device-login')(openPage, refresh);

var status = messages.status;
var deliver = messages.deliver;

function openPage(html) {
  Pebble.openURL(C.CONFIGURATION_URL_PREFIX + encodeURIComponent(html));
}

function choose(id, updating) {
  var current = accounts.select(id);

  // Do not cancel token renewal: its rotated credentials still belong to its original profile.
  if (current.snapshot) {
    deliver(current.snapshot, updating !== false);
  } else {
    status(current.config ? C.UPDATING_STATUS : C.OPEN_APP_SETTINGS);
  }
}

function navigate(direction) {
  var rows = accounts.ordered(accounts.load());
  var index = -1;

  rows.forEach(function (a, i) {
    if (a.id === accounts.current().id) {
      index = i;
    }
  });

  if (index < 0) {
    index = direction < 0 ? 0 : -1;
  }

  choose(rows[(index + (direction < 0 ? -1 : 1) + rows.length) % rows.length].id);
  refresh();
}

function refresh() {
  var pending = login.pending();

  if (pending && pending.profileId === accounts.current().id) {
    login.complete();
  } else {
    refreshAccount();
  }
}

function showSettings() {
  openPage(pages.settings(accounts.view()));
}

Pebble.addEventListener(C.PEBBLE_READY_EVENT, refresh);
Pebble.addEventListener(C.PEBBLE_MESSAGE_EVENT, function (event) {
  if (event && event.payload && event.payload.NAV) {
    navigate(event.payload.NAV);
  } else {
    refresh();
  }
});
Pebble.addEventListener(C.PEBBLE_SETTINGS_EVENT, function () {
  var pending = login.pending();
  var current = accounts.current();

  if (pending && pending.profileId === current.id && pending.expiresAt > Date.now()) {
    pending.label = current.label;
    openPage(pages.device(pending));
  } else {
    if (pending && pending.expiresAt <= Date.now()) {
      login.cancel();
    }

    showSettings();
  }
});
Pebble.addEventListener(
  C.PEBBLE_SETTINGS_CLOSED_EVENT,
  require('./companion/settings-actions')(login, choose, refresh, openPage, showSettings)
);
