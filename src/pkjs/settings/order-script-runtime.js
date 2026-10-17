var C = require('../resources/settings/order-script-runtime');

/* global closePage -- Installed by page shell. */
module.exports = function () {
  var list = document.getElementById(C.ID_WATCH_ORDER);
  var save = document.getElementById(C.ID_SAVE_ORDER);
  var moving = null;
  var startY = 0;
  var pointerMoved = false;

  function changed() {
    save.disabled = false;
    document.getElementById(C.ID_SETTINGS_MESSAGE).textContent = C.CHANGES_READY_TO_SAVE;
  }

  function place(y) {
    var rows = Array.prototype.slice.call(list.children).filter(function (row) {
      return row !== moving;
    });
    var first = rows.map(function (row) {
      return row.getBoundingClientRect().top;
    });
    var before = rows.filter(function (row) {
      var r = row.getBoundingClientRect();

      return y < r.top + r.height / C.ROW_MIDPOINT_DIVISOR;
    })[0];

    if (
      (before && before === moving.nextElementSibling) ||
      (!before && moving === list.lastElementChild)
    ) {
      return;
    }

    list.insertBefore(moving, before || null);
    rows.forEach(function (row, i) {
      var delta = first[i] - row.getBoundingClientRect().top;

      if (Math.abs(delta) > 1) {
        row.style.transition = C.NO_TRANSITION;
        row.style.transform = C.TRANSLATE_Y_OPEN + delta + C.TRANSLATE_Y_CLOSE;
        requestAnimationFrame(function () {
          row.style.transition = C.REORDER_TRANSITION;
          row.style.transform = '';
        });
      }
    });
    changed();
  }

  list.addEventListener(C.EVENT_DRAGSTART, function (e) {
    var handle = e.target.closest(C.SELECTOR_DRAG_HANDLE);

    if (!handle) {
      return;
    }

    moving = handle.closest(C.SELECTOR_ORDER_ITEM);
    moving.classList.add(C.DRAGGING_CLASS);
    e.dataTransfer.effectAllowed = C.EVENT_MOVE;
    e.dataTransfer.setData(C.TEXT_PLAIN, moving.getAttribute(C.ATTRIBUTE_DATA_ACCOUNT_ID));
  });
  list.addEventListener(C.EVENT_DRAGOVER, function (e) {
    if (moving) {
      e.preventDefault();
      place(e.clientY);
    }
  });
  list.addEventListener(C.EVENT_DROP, function (e) {
    e.preventDefault();

    if (moving) {
      moving.classList.remove(C.DRAGGING_CLASS);
    }

    moving = null;
  });
  list.addEventListener(C.EVENT_DRAGEND, function () {
    if (moving) {
      moving.classList.remove(C.DRAGGING_CLASS);
    }

    moving = null;
  });
  list.addEventListener(C.EVENT_POINTERDOWN, function (e) {
    var handle = e.target.closest(C.SELECTOR_DRAG_HANDLE);

    if (!handle) {
      return;
    }

    e.preventDefault();
    handle.focus();
    moving = handle.closest(C.SELECTOR_ORDER_ITEM);
    startY = e.clientY;
    pointerMoved = false;

    if (handle.setPointerCapture) {
      handle.setPointerCapture(e.pointerId);
    }

    moving.classList.add(C.DRAGGING_CLASS);
  });
  list.addEventListener(C.EVENT_POINTERMOVE, function (e) {
    if (moving) {
      if (Math.abs(e.clientY - startY) > C.DRAG_THRESHOLD_PX) {
        pointerMoved = true;
      }

      if (pointerMoved) {
        e.preventDefault();
        place(e.clientY);

        if (e.clientY < C.AUTOSCROLL_EDGE_PX) {
          window.scrollBy(0, -C.AUTOSCROLL_STEP_PX);
        } else if (e.clientY > window.innerHeight - C.AUTOSCROLL_EDGE_PX) {
          window.scrollBy(0, C.AUTOSCROLL_STEP_PX);
        }
      }
    }
  });

  function endPointer() {
    if (moving) {
      moving.classList.remove(C.DRAGGING_CLASS);
    }

    moving = null;
  }

  list.addEventListener(C.EVENT_POINTERUP, endPointer);
  list.addEventListener(C.EVENT_POINTERCANCEL, endPointer);
  list.addEventListener(C.EVENT_KEYDOWN, function (e) {
    if (
      !e.target.closest(C.SELECTOR_DRAG_HANDLE) ||
      (e.key !== C.EVENT_ARROW_UP && e.key !== C.EVENT_ARROW_DOWN)
    ) {
      return;
    }

    e.preventDefault();
    var row = e.target.closest(C.SELECTOR_ORDER_ITEM);

    if (e.key === C.EVENT_ARROW_UP && row.previousElementSibling) {
      list.insertBefore(row, row.previousElementSibling);
      changed();
    } else if (e.key === C.EVENT_ARROW_DOWN && row.nextElementSibling) {
      list.insertBefore(row.nextElementSibling, row);
      changed();
    }

    e.target.focus();
  });
  save.onclick = function () {
    closePage({
      action: C.ACTION_REORDER_ACCOUNTS,
      accountIds: Array.prototype.map.call(list.children, function (row) {
        return row.getAttribute(C.ATTRIBUTE_DATA_ACCOUNT_ID);
      })
    });
  };
};

// Serialized browser factories carry only their own constant dependencies.
module.exports.constants = C;
