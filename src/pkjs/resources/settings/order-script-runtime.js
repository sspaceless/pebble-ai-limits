/** Explicit constant dependencies; these alone accompany the browser factory. */
var dom = require('../shared/dom');
var text = require('../shared/text');
var limits = require('../shared/limits');
var styles = require('../shared/styles');
var events = require('../shared/events');
var http = require('../shared/http');
var storage = require('../shared/storage');
var actions = require('../shared/actions');

module.exports = {
  ID_WATCH_ORDER: dom.ID_WATCH_ORDER,
  ID_SAVE_ORDER: dom.ID_SAVE_ORDER,
  ID_SETTINGS_MESSAGE: dom.ID_SETTINGS_MESSAGE,
  CHANGES_READY_TO_SAVE: text.CHANGES_READY_TO_SAVE,
  ROW_MIDPOINT_DIVISOR: limits.ROW_MIDPOINT_DIVISOR,
  NO_TRANSITION: dom.NO_TRANSITION,
  TRANSLATE_Y_OPEN: styles.TRANSLATE_Y_OPEN,
  TRANSLATE_Y_CLOSE: styles.TRANSLATE_Y_CLOSE,
  REORDER_TRANSITION: styles.REORDER_TRANSITION,
  EVENT_DRAGSTART: events.EVENT_DRAGSTART,
  SELECTOR_DRAG_HANDLE: dom.SELECTOR_DRAG_HANDLE,
  SELECTOR_ORDER_ITEM: dom.SELECTOR_ORDER_ITEM,
  DRAGGING_CLASS: dom.DRAGGING_CLASS,
  EVENT_MOVE: events.EVENT_MOVE,
  TEXT_PLAIN: http.TEXT_PLAIN,
  ATTRIBUTE_DATA_ACCOUNT_ID: dom.ATTRIBUTE_DATA_ACCOUNT_ID,
  EVENT_DRAGOVER: events.EVENT_DRAGOVER,
  EVENT_DROP: events.EVENT_DROP,
  EVENT_DRAGEND: events.EVENT_DRAGEND,
  EVENT_POINTERDOWN: events.EVENT_POINTERDOWN,
  EVENT_POINTERMOVE: events.EVENT_POINTERMOVE,
  DRAG_THRESHOLD_PX: limits.DRAG_THRESHOLD_PX,
  AUTOSCROLL_EDGE_PX: limits.AUTOSCROLL_EDGE_PX,
  AUTOSCROLL_STEP_PX: limits.AUTOSCROLL_STEP_PX,
  EVENT_POINTERUP: events.EVENT_POINTERUP,
  EVENT_POINTERCANCEL: events.EVENT_POINTERCANCEL,
  EVENT_KEYDOWN: storage.EVENT_KEYDOWN,
  EVENT_ARROW_UP: events.EVENT_ARROW_UP,
  EVENT_ARROW_DOWN: events.EVENT_ARROW_DOWN,
  ACTION_REORDER_ACCOUNTS: actions.ACTION_REORDER_ACCOUNTS
};
