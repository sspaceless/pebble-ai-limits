/** Codex adapter facade; claims, session parsing, quota, and login have independent modules. */
var login = require('./codex/device-login');

module.exports = {
  beginLogin: login.begin,
  pollLogin: login.poll,
  renew: require('./codex/renew'),
  usage: require('./codex/usage'),
  normalizeUsage: require('./codex/quota'),
  tokens: require('./codex/session'),
  cancel: require('../network/http').cancel
};
