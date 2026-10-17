var C = require('../resources/settings/menus');

/** Self-contained WebView module; dependencies are passed explicitly. */
module.exports = function () {
  document.addEventListener(
    C.EVENT_TOGGLE,
    function (event) {
      var menu = event.target;

      if (menu.classList && menu.classList.contains(C.ACCOUNT_MENU_CLASS) && menu.open) {
        document.querySelectorAll(C.SELECTOR_ACCOUNT_MENU).forEach(function (other) {
          if (other !== menu) {
            other.open = false;
          }
        });
      }
    },
    true
  );
  document.addEventListener(C.EVENT_CLICK, function (event) {
    document.querySelectorAll(C.SELECTOR_ACCOUNT_MENU).forEach(function (menu) {
      if (!menu.contains(event.target)) {
        menu.open = false;
      }
    });
  });
  document.addEventListener(C.EVENT_KEYDOWN, function (event) {
    if (event.key === C.EVENT_ESCAPE) {
      document.querySelectorAll(C.SELECTOR_ACCOUNT_MENU).forEach(function (menu) {
        menu.open = false;
      });
    }
  });
};

// Serialized browser factories carry only their own constant dependencies.
module.exports.constants = C;
