/** Explicit constant dependencies; these alone accompany the browser factory. */
var events = require('../shared/events');
var dom = require('../shared/dom');
var storage = require('../shared/storage');

module.exports = {
  EVENT_TOGGLE: events.EVENT_TOGGLE,
  ACCOUNT_MENU_CLASS: dom.ACCOUNT_MENU_CLASS,
  SELECTOR_ACCOUNT_MENU: dom.SELECTOR_ACCOUNT_MENU,
  EVENT_CLICK: events.EVENT_CLICK,
  EVENT_KEYDOWN: storage.EVENT_KEYDOWN,
  EVENT_ESCAPE: events.EVENT_ESCAPE
};
