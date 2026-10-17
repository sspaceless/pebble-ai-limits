/** Configuration page facade; no saved credentials are embedded in page URLs. */
module.exports = {
  settings: require('./settings/pages/settings'),
  accountName: require('./settings/pages/account-name'),
  credentials: require('./settings/pages/credentials'),
  device: require('./settings/pages/device')
};
