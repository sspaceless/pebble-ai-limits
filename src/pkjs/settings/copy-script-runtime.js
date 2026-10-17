var C = require('../resources/settings/copy-script-runtime');

module.exports = function () {
  var copyTimer;

  function copyCode() {
    var value = document.getElementById(C.ID_DEVICE_CODE).textContent;
    var status = document.getElementById(C.ID_COPY_STATUS);

    function result(ok) {
      clearTimeout(copyTimer);
      status.textContent = ok ? C.COPIED_LABEL : C.SELECT_CODE_TO_COPY;
      copyTimer = setTimeout(function () {
        status.textContent = C.COPY_CODE;
      }, C.COPY_FEEDBACK_DURATION_MS);
    }

    function fallback() {
      var input = document.createElement(C.TEXTAREA_TAG);

      input.value = value;
      input.readOnly = true;
      input.style.cssText = C.CLIPBOARD_FALLBACK_STYLE;
      document.body.appendChild(input);
      var focused = document.activeElement;
      var ok = false;

      try {
        input.focus();
        input.select();
        input.setSelectionRange(0, value.length);
        ok = document.execCommand(C.CLIPBOARD_COPY_COMMAND);
      } catch (_error) {
        /* Clipboard failure falls back to code selection. */
      }

      document.body.removeChild(input);

      if (focused && focused.focus) {
        focused.focus();
      }

      if (!ok) {
        var range = document.createRange();

        range.selectNodeContents(document.getElementById(C.ID_DEVICE_CODE));
        var selection = window.getSelection();

        selection.removeAllRanges();
        selection.addRange(range);
      }

      result(ok);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        navigator.clipboard.writeText(value).then(function () {
          result(true);
        }, fallback);
      } catch (_error) {
        fallback();
      }
    } else {
      fallback();
    }
  }

  window.copyCode = copyCode;
};

// Serialized browser factories carry only their own constant dependencies.
module.exports.constants = C;
