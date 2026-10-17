var codex = require('./direct');
var plans = require('./plans');
var CATALOG = [
  { id: 'codex', name: 'Codex', kind: 'subscription' },
  { id: 'claude', name: 'Claude', kind: 'subscription' },
  { id: 'gemini', name: 'Gemini CLI', kind: 'subscription' },
  { id: 'claude-api', name: 'Claude API', kind: 'api' },
  { id: 'gemini-api', name: 'Gemini API', kind: 'api' },
  { id: 'custom', name: 'Custom', kind: 'custom' }
];
// Public installed-application credentials from Google's open-source Gemini CLI.
var GOOGLE_CLIENT = '681255809395-oo8ft2oprdrnp9e3aqf6av3hmdib135j.apps.googleusercontent.com';
var GOOGLE_SECRET = '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';
function info(id) {
  for (var i = 0; i < CATALOG.length; i++) {
    if (CATALOG[i].id === id) {
      return CATALOG[i];
    }
  }
  return null;
}
function number(value) {
  return typeof value === 'number' && isFinite(value);
}
function timestamp(value) {
  if (number(value)) {
    return value > 0 ? Math.floor(value) : 0;
  }
  var n = Date.parse(value);
  return isFinite(n) && n > 0 ? Math.floor(n / 1000) : 0;
}
function unknown(note) {
  return { left: -1, resetsAt: 0, value: '', note: note || '' };
}
function windowQuota(value, note, duration) {
  if (!value) {
    return unknown(note);
  }
  var used = value.utilization;
  if (!number(used)) {
    used = value.used_percentage;
  }
  return {
    left: number(used) ? Math.round(Math.max(0, Math.min(100, 100 - used))) : -1,
    resetsAt: timestamp(value.resets_at),
    note: note || '',
    value: '',
    windowMins: duration || 0
  };
}
function snapshot(primary, secondary, updated, status, plan) {
  return {
    primary: primary,
    secondary: secondary,
    updatedAt: updated || Math.floor(Date.now() / 1000),
    status: status || '',
    plan: plans.label(plan)
  };
}
function claudeUsage(payload) {
  var limits = payload.rate_limits || payload;
  if (
    !Object.prototype.hasOwnProperty.call(limits, 'five_hour') &&
    !Object.prototype.hasOwnProperty.call(limits, 'seven_day')
  ) {
    throw new Error('Invalid usage');
  }
  return snapshot(
    windowQuota(limits.five_hour, '', 300),
    windowQuota(limits.seven_day, '', 10080),
    null,
    null,
    payload.subscription_type || payload.plan_type
  );
}
function geminiUsage(payload, config) {
  if (!Array.isArray(payload.buckets)) {
    throw new Error('Invalid quotas');
  }
  function bucket(model) {
    var candidates = payload.buckets.filter(function (b) {
      return b.modelId === model;
    });
    if (!candidates.length) {
      return unknown(model);
    }
    var known = candidates.filter(function (b) {
      return number(b.remainingFraction);
    });
    if (!known.length) {
      return unknown(model);
    }
    var b = known.reduce(function (a, b) {
      return a.remainingFraction < b.remainingFraction ? a : b;
    });
    return {
      left: Math.round(Math.max(0, Math.min(100, b.remainingFraction * 100))),
      resetsAt: timestamp(b.resetTime),
      value: '',
      windowKey: model,
      windowMins: 0,
      note: model.replace(/^gemini-/, '').slice(0, 12)
    };
  }
  var models = payload.buckets
    .map(function (b) {
      return b.modelId;
    })
    .filter(function (m, i, a) {
      return m && a.indexOf(m) === i;
    })
    .sort();
  var first = config.model || models[0],
    second =
      config.secondaryModel ||
      models.filter(function (m) {
        return m !== first;
      })[0];
  return snapshot(bucket(first), bucket(second), null, null, config.plan);
}
function compact(n) {
  if (n === -1) {
    return 'Unlim.';
  }
  if (!number(n) || n < 0) {
    return '--';
  }
  if (n >= 1000000) {
    return String(Math.round(n / 100000) / 10) + 'M';
  }
  if (n >= 1000) {
    return String(Math.round(n / 100) / 10) + 'K';
  }
  return String(n);
}
function cap(value, note) {
  return { left: -1, resetsAt: 0, value: compact(value), note: note };
}
function claudeCaps(payload, config) {
  if (!Array.isArray(payload.data)) {
    throw new Error('Invalid limits');
  }
  var groups = payload.data.filter(function (g) {
    return Array.isArray(g.models) && g.models.indexOf(config.model) >= 0;
  });
  if (groups.length !== 1) {
    throw new Error('Model limits unavailable');
  }
  var values = {};
  (groups[0].limits || []).forEach(function (v) {
    values[v.type] = v.value;
  });
  return snapshot(
    cap(values.requests_per_minute, 'requests/min cap'),
    cap(values.input_tokens_per_minute, 'input tokens/min cap'),
    null,
    'Configured caps'
  );
}
function geminiCaps(payload, config) {
  if (!Array.isArray(payload.metrics)) {
    throw new Error('Invalid metrics');
  }
  var metric = payload.metrics.filter(function (m) {
    return m.metric === config.quotaMetric;
  });
  if (metric.length !== 1 || !/request/i.test(metric[0].metric)) {
    throw new Error('Request quota metric unavailable');
  }
  var rows = {};
  (metric[0].consumerQuotaLimits || []).forEach(function (limit) {
    var unit = limit.unit || '';
    if (!/^1\/(?:min|d)(?:\/|$)/.test(unit)) {
      return;
    }
    if (unit.indexOf('{user}') >= 0) {
      return;
    }
    var period = unit.indexOf('/min') >= 0 ? 'minute' : unit.indexOf('/d') >= 0 ? 'day' : null;
    if (!period) {
      return;
    }
    var buckets = (limit.quotaBuckets || []).filter(function (b) {
      var d = b.dimensions || {};
      return (
        (d.model === config.model || !d.model) &&
        Object.keys(d).every(function (k) {
          return k === 'model' || (k === 'region' && d[k] === 'global');
        })
      );
    });
    var exact = buckets.filter(function (b) {
      return (b.dimensions || {}).model === config.model;
    });
    if (exact.length) {
      buckets = exact;
    }
    if (buckets.length !== 1 || rows[period]) {
      throw new Error('Ambiguous quota dimensions');
    }
    var value = buckets[0].effectiveLimit;
    rows[period] = /^(-1|\d+)$/.test(String(value)) ? Number(value) : NaN;
  });
  if (!Object.keys(rows).length) {
    throw new Error('No matching quotas');
  }
  return snapshot(
    cap(rows.minute, 'requests/min cap'),
    cap(rows.day, 'requests/day cap'),
    null,
    'Configured caps'
  );
}
function customUsage(payload) {
  function row(r) {
    if (!r || !number(r.left) || r.left < -1 || r.left > 100) {
      throw new Error('Invalid quota');
    }
    return {
      left: Math.round(r.left),
      resetsAt: timestamp(r.resetsAt),
      value: '',
      windowMins: number(r.windowMins) ? r.windowMins : 0,
      windowKey: typeof r.windowKey === 'string' ? r.windowKey : '',
      note: String(r.note || '').slice(0, 23)
    };
  }
  if (
    !number(payload.updatedAt) ||
    payload.updatedAt <= 0 ||
    payload.updatedAt > Date.now() / 1000 + 60
  ) {
    throw new Error('Invalid timestamp');
  }
  return snapshot(
    row(payload.primary),
    row(payload.secondary),
    Math.floor(payload.updatedAt),
    null,
    payload.plan
  );
}
function parseConfig(id, input) {
  if (!info(id) || id === 'codex') {
    throw new Error('Invalid provider');
  }
  var raw = (input.credentials || '').trim();
  var isJson = raw.charAt(0) === '{';
  var parsed = isJson ? JSON.parse(raw) : {};
  var oauth = parsed.claudeAiOauth || parsed;
  var config = {
    provider: id,
    mode: 'direct',
    accessToken: oauth.accessToken || oauth.access_token || (isJson ? '' : raw),
    refreshToken: oauth.refreshToken || oauth.refresh_token || '',
    expiresAt: oauth.expiry_date
      ? Math.floor(oauth.expiry_date / 1000)
      : oauth.expiresAt
        ? Math.floor(oauth.expiresAt / 1000)
        : 0,
    plan:
      id === 'claude'
        ? plans.label(oauth.subscriptionType || oauth.subscription_type)
        : id === 'gemini'
          ? plans.label(oauth.userTierName)
          : '',
    clientId: oauth.client_id || input.clientId || '',
    clientSecret: oauth.client_secret || input.clientSecret || '',
    project: (input.project || '').trim(),
    model: (input.model || '').trim(),
    secondaryModel: (input.secondaryModel || '').trim(),
    quotaMetric: (input.quotaMetric || '').trim()
  };
  if (id === 'custom') {
    if (!/^https:\/\/[a-zA-Z0-9.-]+(?::\d{1,5})?(?:\/[^\s?#]*)?$/.test(input.url || '')) {
      throw new Error('HTTPS endpoint required');
    }
    if (/\s/.test((input.credentials || '').trim())) {
      throw new Error('Invalid bearer token');
    }
    return {
      provider: id,
      mode: 'direct',
      url: input.url,
      name: String(input.name || 'Custom').slice(0, 20),
      accessToken: (input.credentials || '').trim()
    };
  }
  if (
    (!config.accessToken && !config.refreshToken) ||
    typeof config.accessToken !== 'string' ||
    /\s/.test(config.accessToken)
  ) {
    throw new Error('Credentials required');
  }
  if (!config.accessToken && config.refreshToken) {
    config.expiresAt = 1;
  }
  if (id === 'claude-api') {
    config.apiKey = config.accessToken;
    if (!config.model) {
      throw new Error('Model required');
    }
  }
  if (id === 'gemini' && config.project && !/^[a-zA-Z0-9:_-]+$/.test(config.project)) {
    throw new Error('Code Assist project required');
  }
  if (
    id === 'gemini-api' &&
    (!/^\d+$/.test(config.project) ||
      !config.quotaMetric ||
      !config.model ||
      /^AIza/.test(config.accessToken))
  ) {
    throw new Error('Cloud OAuth, project number, metric and model required');
  }
  return config;
}
function usage(id, config, done) {
  if (id === 'codex') {
    return codex.usage(config, done);
  }
  if (id === 'gemini' && !config.project) {
    return codex.http(
      'POST',
      'https://cloudcode-pa.googleapis.com/v1internal:loadCodeAssist',
      JSON.stringify({
        mode: 'HEALTH_CHECK',
        metadata: {
          ideType: 'IDE_UNSPECIFIED',
          platform: 'PLATFORM_UNSPECIFIED',
          pluginType: 'GEMINI'
        }
      }),
      { Authorization: 'Bearer ' + config.accessToken, 'Content-Type': 'application/json' },
      function (error, payload) {
        if (error) {
          return done(error);
        }
        var project =
          typeof payload.cloudaicompanionProject === 'string'
            ? payload.cloudaicompanionProject
            : (payload.cloudaicompanionProject || {}).id;
        if (typeof project !== 'string' || !/^[a-zA-Z0-9:_-]+$/.test(project)) {
          return done({ invalidData: true });
        }
        config.project = project;
        config.plan = plans.label((payload.paidTier || payload.currentTier || {}).name);
        usage(id, config, done);
      }
    );
  }
  var method = 'GET',
    body = null,
    headers = { Accept: 'application/json' },
    url,
    normalize;
  if (id === 'claude') {
    url = 'https://api.anthropic.com/api/oauth/usage';
    headers.Authorization = 'Bearer ' + config.accessToken;
    headers['anthropic-beta'] = 'oauth-2025-04-20';
    normalize = claudeUsage;
  }
  if (id === 'gemini') {
    url = 'https://cloudcode-pa.googleapis.com/v1internal:retrieveUserQuota';
    method = 'POST';
    headers.Authorization = 'Bearer ' + config.accessToken;
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({ project: config.project });
    normalize = function (p) {
      return geminiUsage(p, config);
    };
  }
  if (id === 'claude-api') {
    url =
      'https://api.anthropic.com/v1/organizations/rate_limits?model=' +
      encodeURIComponent(config.model);
    headers['x-api-key'] = config.apiKey;
    headers['anthropic-version'] = '2023-06-01';
    normalize = function (p) {
      return claudeCaps(p, config);
    };
  }
  if (id === 'gemini-api') {
    url =
      'https://serviceusage.googleapis.com/v1beta1/projects/' +
      config.project +
      '/services/generativelanguage.googleapis.com/consumerQuotaMetrics?view=FULL&pageSize=200';
    headers.Authorization = 'Bearer ' + config.accessToken;
    normalize = function (p) {
      return geminiCaps(p, config);
    };
  }
  if (id === 'custom') {
    url = config.url;
    if (config.accessToken) {
      headers.Authorization = 'Bearer ' + config.accessToken;
    }
    normalize = customUsage;
  }
  if (!url) {
    return done({ invalidData: true });
  }
  var pageCount = 0;
  function fetchPage(pageUrl, acc) {
    if (++pageCount > 20) {
      return done({ invalidData: true });
    }
    codex.http(method, pageUrl, body, headers, function (error, payload) {
      if (error) {
        return done(error);
      }
      if (id === 'gemini-api') {
        if (!Array.isArray(payload.metrics)) {
          return done({ invalidData: true });
        }
        acc = acc.concat(payload.metrics);
        if (payload.nextPageToken) {
          if (acc.length > 4000) {
            return done({ invalidData: true });
          }
          return fetchPage(url + '&pageToken=' + encodeURIComponent(payload.nextPageToken), acc);
        }
        payload = { metrics: acc };
      }
      var result;
      try {
        result = normalize(payload);
      } catch (_) {
        return done({ invalidData: true });
      }
      if (!result.plan) {
        result.plan = plans.label(config.plan);
      }
      done(null, result);
    });
  }
  fetchPage(url, []);
}
function renew(id, config, done) {
  if (id === 'codex') {
    return codex.renew(config, done);
  }
  if (!config.refreshToken) {
    return done({ status: 401 });
  }
  var url,
    body,
    headers = { 'Content-Type': 'application/json' };
  if (id === 'claude') {
    url = 'https://platform.claude.com/v1/oauth/token';
    body = JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: config.refreshToken,
      client_id: config.clientId || '9d1c250a-e61b-44d9-88ed-5944d1962f5e'
    });
  }
  if (id === 'gemini' || id === 'gemini-api') {
    url = 'https://oauth2.googleapis.com/token';
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    var params = {
      grant_type: 'refresh_token',
      refresh_token: config.refreshToken,
      client_id: config.clientId || GOOGLE_CLIENT,
      client_secret: config.clientSecret || (config.clientId ? '' : GOOGLE_SECRET)
    };
    body = Object.keys(params)
      .map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
      })
      .join('&');
  }
  if (!url) {
    return done({ status: 401 });
  }
  codex.http('POST', url, body, headers, function (error, result) {
    if (error) {
      return done(error);
    }
    if (typeof result.access_token !== 'string' || !result.access_token) {
      return done({ invalidData: true });
    }
    var next = {};
    Object.keys(config).forEach(function (k) {
      next[k] = config[k];
    });
    next.accessToken = result.access_token;
    next.refreshToken = result.refresh_token || config.refreshToken;
    next.expiresAt = number(result.expires_in)
      ? Math.floor(Date.now() / 1000) + result.expires_in
      : 0;
    done(null, next);
  });
}
module.exports = {
  catalog: CATALOG,
  info: info,
  usage: usage,
  renew: renew,
  parseConfig: parseConfig,
  claudeUsage: claudeUsage,
  geminiUsage: geminiUsage,
  claudeCaps: claudeCaps,
  geminiCaps: geminiCaps,
  customUsage: customUsage
};
