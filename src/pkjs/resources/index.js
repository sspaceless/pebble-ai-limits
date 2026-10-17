/** Explicit constant dependencies; these alone accompany the browser factory. */
var endpoints = require('./shared/endpoints');
var text = require('./shared/text');
var syntax = require('./shared/syntax');
var events = require('./shared/events');

module.exports = {
  CONFIGURATION_URL_PREFIX: endpoints.CONFIGURATION_URL_PREFIX,
  UPDATING_STATUS: text.UPDATING_STATUS,
  OPEN_APP_SETTINGS: syntax.OPEN_APP_SETTINGS,
  PEBBLE_READY_EVENT: events.PEBBLE_READY_EVENT,
  PEBBLE_MESSAGE_EVENT: events.PEBBLE_MESSAGE_EVENT,
  PEBBLE_SETTINGS_EVENT: events.PEBBLE_SETTINGS_EVENT,
  PEBBLE_SETTINGS_CLOSED_EVENT: events.PEBBLE_SETTINGS_CLOSED_EVENT
};
