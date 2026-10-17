/** Explicit constant dependencies; these alone accompany the browser factory. */
var dom = require('../shared/dom');
var text = require('../shared/text');
var limits = require('../shared/limits');
var styles = require('../shared/styles');

module.exports = {
  ID_DEVICE_CODE: dom.ID_DEVICE_CODE,
  ID_COPY_STATUS: dom.ID_COPY_STATUS,
  COPIED_LABEL: text.COPIED_LABEL,
  SELECT_CODE_TO_COPY: text.SELECT_CODE_TO_COPY,
  COPY_CODE: text.COPY_CODE,
  COPY_FEEDBACK_DURATION_MS: limits.COPY_FEEDBACK_DURATION_MS,
  TEXTAREA_TAG: dom.TEXTAREA_TAG,
  CLIPBOARD_FALLBACK_STYLE: styles.CLIPBOARD_FALLBACK_STYLE,
  CLIPBOARD_COPY_COMMAND: dom.CLIPBOARD_COPY_COMMAND
};
