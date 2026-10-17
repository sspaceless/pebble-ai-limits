var C = require('../../resources/providers/codex/session');
var jwt = require('../../auth/jwt');
var plans = require('../../plans');

/**
 * Convert an OAuth token response to a new Codex session without persisting it.
 * Previous account/refresh/plan metadata fills omitted fields. JWT claims are decoded
 * for metadata only; this function does not verify token signatures.
 * @param {Object} response OAuth response containing a nonempty access_token.
 * @param {Object} [previousSession] Existing session used for fallback metadata.
 * @returns {Object} New session with expiry in Unix seconds; zero means unknown expiry.
 * @throws {Error} If token data is malformed or an account ID cannot be resolved.
 */
function tokens(response, previousSession) {
  var previous = previousSession || {};

  if (!response || typeof response.access_token !== 'string' || !response.access_token) {
    throw new Error(C.ERROR_MISSING_ACCESS_TOKEN);
  }

  var claims = jwt(response.id_token || response.access_token);
  var accessClaims = jwt(response.access_token);
  var account =
    (claims[C.CODEX_CLAIMS_NAMESPACE] || {}).chatgpt_account_id ||
    (accessClaims[C.CODEX_CLAIMS_NAMESPACE] || {}).chatgpt_account_id ||
    previous.accountId;

  if (!account) {
    throw new Error(C.ERROR_MISSING_ACCOUNT_ID);
  }

  var exp = jwt(response.access_token).exp;
  var expiresAt =
    typeof response.expires_in === 'number'
      ? Math.floor(Date.now() / C.MILLISECONDS_PER_SECOND) + response.expires_in
      : typeof exp === 'number'
        ? exp
        : 0;

  return {
    mode: C.CONNECTION_MODE_DIRECT,
    accessToken: response.access_token,
    refreshToken: response.refresh_token || previous.refreshToken,
    accountId: account,
    expiresAt: expiresAt,
    plan: plans.label(
      (claims[C.CODEX_CLAIMS_NAMESPACE] || {}).chatgpt_plan_type ||
        (accessClaims[C.CODEX_CLAIMS_NAMESPACE] || {}).chatgpt_plan_type ||
        previous.plan
    )
  };
}

module.exports = tokens;
