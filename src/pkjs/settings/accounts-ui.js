var runtime = require('./runtime');
var serialize = require('./serialize');

var modules = {
  list: require('./account-list'),
  device: require('./device-login'),
  name: require('./name-editor'),
  connection: require('./connection-editor'),
  picker: require('./provider-picker'),
  menus: require('./menus'),
  fields: require('./connection-fields'),
  validation: require('./connection-validation'),
  validName: require('../validation/account-name')
};

/** Serialize only browser modules and public draft data into the WebView. */
exports.script = function (state, catalog, icons) {
  return serialize(runtime, [state, catalog, icons], modules);
};
