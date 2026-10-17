/** Pure deadline policy shared by the companion and settings WebView. */
module.exports = function () {
  function expired(expiresAt, now) {
    return typeof expiresAt !== 'number' || expiresAt <= now;
  }

  return { expired: expired };
};
