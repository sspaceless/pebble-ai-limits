var C = require('../resources/companion/watch-messages');
var accounts = require('../accounts');
var send = require('./watch-outbox');
var errorStatus = require('./error-status');

function status(value) {
  var updating = value === C.UPDATING_STATUS;

  send({ STATUS: updating ? '' : value, UPDATING: updating ? 1 : 0 });
}

function statusFor(id, value) {
  if (accounts.current().id === id) {
    status(value);
  }
}

function deliver(data, updating) {
  var p = data.primary;
  var s = data.secondary;

  if (!p || !s || typeof data.updatedAt !== 'number') {
    throw new Error(C.ERROR_INVALID_LIMITS);
  }

  send({
    P_LEFT: p.left,
    P_RESET: p.resetsAt,
    S_LEFT: s.left,
    S_RESET: s.resetsAt,
    P_VALUE: p.value || '',
    S_VALUE: s.value || '',
    P_NOTE: p.note || '',
    S_NOTE: s.note || '',
    UPDATED: data.updatedAt,
    STATUS: data.status || '',
    UPDATING: updating ? 1 : 0
  });
}

module.exports = {
  status: status,
  statusFor: statusFor,
  deliver: deliver,
  errorStatus: errorStatus
};
