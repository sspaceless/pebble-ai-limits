var accounts = require('../accounts');
var describe = require('./watch-identity');

var outboxBusy = false;
var outboxLatest = null;

/** Coalesce pending messages and validate account identity when each message is sent. */
function send(message) {
  outboxLatest = describe(message);
  flushOutbox();
}

function flushOutbox() {
  if (outboxBusy) {
    return;
  }

  var current = accounts.current();
  var message = outboxLatest;

  outboxLatest = null;

  if (!message) {
    return;
  }

  if (message.ACCOUNT_ID !== current.id || message.ACCOUNT_REV !== current.revision) {
    if (outboxLatest) {
      flushOutbox();
    }

    return;
  }

  message.ACCOUNT_NAME = current.label;
  outboxBusy = true;
  Pebble.sendAppMessage(
    message,
    function () {
      outboxBusy = false;
      flushOutbox();
    },
    function () {
      outboxBusy = false;

      if (outboxLatest) {
        flushOutbox();
      }
    }
  );
}

module.exports = send;
