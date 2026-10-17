var C = require('../resources/companion/watch-identity');
var accounts = require('../accounts');
var providers = require('../providers');
var plans = require('../plans');

/**
 * Attach the currently selected profile identity and header to an outgoing message.
 * @param {Object} message Mutable watch payload; identity fields are overwritten in place.
 * @returns {Object} The same message object with provider, profile, revision, and count fields.
 */
function describe(message) {
  var current = accounts.current();
  var provider = providers.info(current.provider);

  message.PROVIDER = providers.catalog.indexOf(provider);
  var providerName =
    current.provider === C.PROVIDER_CUSTOM && current.config ? current.config.name : provider.name;
  var plan = plans.label((current.snapshot || {}).plan || (current.config || {}).plan);

  message.PROVIDER_NAME = plans.header(providerName, plan);
  message.ACCOUNT_COUNT = accounts.ordered(accounts.load()).length;
  message.ACCOUNT_ID = current.id;
  message.ACCOUNT_NAME = current.label;
  message.ACCOUNT_REV = current.revision;

  return message;
}

module.exports = describe;
