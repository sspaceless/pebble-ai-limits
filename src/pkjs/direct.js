/* Internal Codex endpoints, based on OpenAI's open-source CLI. ES5 for PebbleKit. */
var plans = require('./plans');
var AUTH = 'https://auth.openai.com';
var CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';
var USAGE = 'https://chatgpt.com/backend-api/wham/usage';
var requestGenerations = { usage: 0, login: 0 };

function jwt(token) {
  try {
    var encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var bits = 0,
      count = 0,
      decoded = '';
    for (var i = 0; i < encoded.length && encoded[i] !== '='; i++) {
      var value = alphabet.indexOf(encoded[i]);
      if (value < 0) {
        return {};
      }
      bits = (bits << 6) | value;
      count += 6;
      if (count >= 8) {
        count -= 8;
        decoded += '%' + ('0' + ((bits >> count) & 255).toString(16)).slice(-2);
      }
    }
    return JSON.parse(decodeURIComponent(decoded));
  } catch (_) {
    return {};
  }
}
function tokens(response, previous) {
  previous = previous || {};
  if (!response || typeof response.access_token !== 'string' || !response.access_token) {
    throw new Error('Missing access token');
  }
  var claims = jwt(response.id_token || response.access_token);
  var accessClaims = jwt(response.access_token);
  var account =
    (claims['https://api.openai.com/auth'] || {}).chatgpt_account_id ||
    (accessClaims['https://api.openai.com/auth'] || {}).chatgpt_account_id ||
    previous.accountId;
  if (!account) {
    throw new Error('Missing account ID');
  }
  var exp = jwt(response.access_token).exp;
  var expiresAt =
    typeof response.expires_in === 'number'
      ? Math.floor(Date.now() / 1000) + response.expires_in
      : typeof exp === 'number'
        ? exp
        : 0;
  return {
    mode: 'direct',
    accessToken: response.access_token,
    refreshToken: response.refresh_token || previous.refreshToken,
    accountId: account,
    expiresAt: expiresAt,
    plan: plans.label(
      (claims['https://api.openai.com/auth'] || {}).chatgpt_plan_type ||
        (accessClaims['https://api.openai.com/auth'] || {}).chatgpt_plan_type ||
        previous.plan
    )
  };
}
function normalizeUsage(payload) {
  if (!payload || !Object.prototype.hasOwnProperty.call(payload, 'rate_limit')) {
    throw new Error('Invalid usage response');
  }
  var limits = payload.rate_limit || {};
  function quota(w) {
    if (!w) {
      return { left: -1, resetsAt: 0, windowMins: 0 };
    }
    return {
      left:
        typeof w.used_percent === 'number' && isFinite(w.used_percent)
          ? Math.round(Math.max(0, Math.min(100, 100 - w.used_percent)))
          : -1,
      resetsAt:
        typeof w.reset_at === 'number' && isFinite(w.reset_at) && w.reset_at > 0
          ? Math.floor(w.reset_at)
          : 0,
      windowMins: typeof w.limit_window_seconds === 'number' ? w.limit_window_seconds / 60 : 0
    };
  }
  return {
    primary: quota(limits.primary_window),
    secondary: quota(limits.secondary_window),
    updatedAt: Math.floor(Date.now() / 1000),
    plan: plans.label(payload.plan_type)
  };
}
function http(method, url, body, headers, done, group) {
  group = group || 'usage';
  var xhr = new XMLHttpRequest();
  var epoch = requestGenerations[group];
  var ended = false;
  function finish(error, data) {
    if (ended || epoch !== requestGenerations[group]) {
      return;
    }
    ended = true;
    done(error, data);
  }
  xhr.open(method, url, true);
  xhr.timeout = 25000;
  Object.keys(headers || {}).forEach(function (key) {
    xhr.setRequestHeader(key, headers[key]);
  });
  xhr.onload = function () {
    var data;
    try {
      data = JSON.parse(xhr.responseText);
    } catch (_) {
      /* Ignore unavailable optional data; use the fallback below. */
    }
    if (xhr.status < 200 || xhr.status >= 300) {
      // Do not expose response bodies, tokens, or authorization codes to logs/watch messages.
      var reason = null;
      if (data && data.error && Array.isArray(data.error.details)) {
        data.error.details.forEach(function (detail) {
          if (detail.reason === 'SUBSCRIPTION_REQUIRED') {
            reason = detail.reason;
          }
        });
      }
      return finish({
        status: xhr.status,
        reason: reason,
        oauthCode: data && typeof data.error === 'string' ? data.error : null
      });
    }
    if (!data) {
      return finish({ status: 0, invalidData: true });
    }
    finish(null, data);
  };
  xhr.onerror = xhr.ontimeout = function () {
    finish({ status: 0 });
  };
  xhr.send(body || null);
}
function jsonPost(path, data, done, group) {
  http(
    'POST',
    AUTH + path,
    JSON.stringify(data),
    { 'Content-Type': 'application/json' },
    done,
    group
  );
}
function beginLogin(done) {
  jsonPost(
    '/api/accounts/deviceauth/usercode',
    { client_id: CLIENT_ID },
    function (error, data) {
      if (error) {
        return done(error);
      }
      var code = data.user_code || data.usercode;
      if (!data.device_auth_id || !code) {
        return done({ invalidData: true });
      }
      done(null, {
        deviceAuthId: data.device_auth_id,
        userCode: code,
        interval: Math.min(60, Math.max(5, Number(data.interval) || 5)),
        expiresAt: Date.now() + 15 * 60 * 1000
      });
    },
    'login'
  );
}
function pollLogin(pending, done) {
  jsonPost(
    '/api/accounts/deviceauth/token',
    { device_auth_id: pending.deviceAuthId, user_code: pending.userCode },
    function (error, data) {
      if (error) {
        error.pending = error.status === 403 || error.status === 404;
        return done(error);
      }
      if (!data.authorization_code || !data.code_verifier) {
        return done({ invalidData: true });
      }
      var form = {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        code: data.authorization_code,
        redirect_uri: AUTH + '/deviceauth/callback',
        code_verifier: data.code_verifier
      };
      var body = Object.keys(form)
        .map(function (key) {
          return encodeURIComponent(key) + '=' + encodeURIComponent(form[key]);
        })
        .join('&');
      http(
        'POST',
        AUTH + '/oauth/token',
        body,
        { 'Content-Type': 'application/x-www-form-urlencoded' },
        function (failure, result) {
          if (failure) {
            return done(failure);
          }
          var session;
          try {
            session = tokens(result);
          } catch (_) {
            return done({ invalidData: true });
          }
          done(null, session);
        },
        'login'
      );
    },
    'login'
  );
}
function renew(config, done) {
  if (!config.refreshToken) {
    return done({ status: 401 });
  }
  jsonPost(
    '/oauth/token',
    { grant_type: 'refresh_token', client_id: CLIENT_ID, refresh_token: config.refreshToken },
    function (error, response) {
      if (error) {
        return done(error);
      }
      var session;
      try {
        session = tokens(response, config);
      } catch (_) {
        return done({ invalidData: true });
      }
      done(null, session);
    }
  );
}
function usage(config, done) {
  http(
    'GET',
    USAGE,
    null,
    {
      Authorization: 'Bearer ' + config.accessToken,
      'ChatGPT-Account-Id': config.accountId,
      Accept: 'application/json'
    },
    function (error, data) {
      if (error) {
        return done(error);
      }
      var normalized;
      try {
        normalized = normalizeUsage(data);
      } catch (_) {
        return done({ invalidData: true });
      }
      if (!normalized.plan) {
        normalized.plan = plans.label(config.plan);
      }
      done(null, normalized);
    }
  );
}
module.exports = {
  http: http,
  beginLogin: beginLogin,
  pollLogin: pollLogin,
  renew: renew,
  usage: usage,
  normalizeUsage: normalizeUsage,
  tokens: tokens,
  cancel: function (group) {
    group = group || 'usage';
    requestGenerations[group]++;
  }
};
