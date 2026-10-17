/* global closePage: writable -- Injected by config.js into the settings WebView. */
// Keep edits inside the configuration webview; only the final save uses pebblejs://close.
exports.script = function (state, catalog, icons) {
  return (
    '(' +
    function (state, catalog, icons) {
      var finish = closePage,
        editing = null,
        connectionAccountId = null,
        connectionOriginal = null,
        connectId = null,
        sequence = 0,
        deviceGeneration = 0,
        deviceTimer = null,
        deviceRequest = null;
      var list = document.getElementById('watch-order'),
        editor = document.getElementById('account-editor'),
        name = document.getElementById('edit-name'),
        connectionEditor = document.getElementById('connection-editor'),
        message = document.getElementById('settings-message'),
        done = document.getElementById('save-settings');
      function escape(value) {
        return String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      }
      function action(label, data, classes) {
        return (
          '<button type="button" class="' +
          classes +
          '" onclick="if(this.className.indexOf(\'menu-action\')>=0){var m=this.parentNode&&this.parentNode.parentNode;if(m&&m.open!==undefined)m.open=false;}closePage(' +
          escape(JSON.stringify(data)) +
          ');">' +
          label +
          '</button>'
        );
      }
      function mark() {
        message.textContent = 'Changes ready to save.';
      }
      function order() {
        var ids = Array.prototype.map.call(list.children, function (row) {
          return row.getAttribute('data-account-id');
        });
        state.accounts = ids.map(function (id) {
          return state.accounts.filter(function (a) {
            return a.id === id;
          })[0];
        });
      }
      function render() {
        list.innerHTML = state.accounts
          .map(function (a) {
            var provider = catalog.filter(function (p) {
                return p.id === a.provider;
              })[0],
              title = provider.name + ' · ' + escape(a.label);
            var connection =
              a.provider === 'codex'
                ? a.configured
                  ? 'Reconnect ChatGPT'
                  : 'Sign in with ChatGPT'
                : a.configured
                  ? 'Update credentials'
                  : 'Connect ' + provider.name;
            return (
              '<li class="order-item" data-account-id="' +
              escape(a.id) +
              '"><button type="button" class="drag-handle" draggable="false" aria-label="Move ' +
              title +
              '">⠿</button>' +
              action(
                '<span class="account-title">' +
                  icons[a.provider] +
                  title +
                  '</span><span class="account-status">' +
                  (a.configured ? 'Connected' : 'Not connected') +
                  (a.id === state.selectedId ? ' · Selected' : '') +
                  '</span>',
                { action: 'selectAccount', accountId: a.id },
                'account-select'
              ) +
              '<details class="account-menu"><summary aria-label="Actions for ' +
              title +
              '">⋯</summary><div class="menu-actions">' +
              action(connection, { action: 'login', accountId: a.id }, 'menu-action') +
              action('Rename', { action: 'renameAccount', accountId: a.id }, 'menu-action') +
              action(
                'Remove',
                { action: 'deleteAccount', accountId: a.id },
                'menu-action destructive'
              ) +
              '</div></details></li>'
            );
          })
          .join('');
        document.getElementById('empty-accounts').hidden = !!state.accounts.length;
        done.textContent = 'Save and close';
      }
      function edit(account, provider) {
        editing = { account: account, provider: provider };
        editor.hidden = false;
        document.getElementById('edit-title').textContent = account
          ? 'Rename account'
          : 'Add account';
        name.value = account ? account.label : '';
        name.focus();
        editor.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      function stopDeviceLogin() {
        deviceGeneration++;
        if (deviceTimer) {
          clearTimeout(deviceTimer);
          deviceTimer = null;
        }
        if (deviceRequest) {
          var request = deviceRequest;
          deviceRequest = null;
          request.abort();
        }
      }
      function postDevice(path, data, done) {
        var request = new XMLHttpRequest();
        deviceRequest = request;
        request.open('POST', 'https://auth.openai.com' + path, true);
        request.timeout = 20000;
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
          if (deviceRequest === request) {
            deviceRequest = null;
          }
          var body;
          try {
            body = JSON.parse(request.responseText);
          } catch (_) {
            return done({ error: true });
          }
          if (request.status < 200 || request.status >= 300) {
            return done({ error: true, status: request.status, body: body });
          }
          done(null, body);
        };
        request.onerror = request.ontimeout = function () {
          if (deviceRequest === request) {
            deviceRequest = null;
          }
          done({ error: true });
        };
        request.send(JSON.stringify(data));
      }
      function startCodexLogin(account) {
        stopDeviceLogin();
        var generation = deviceGeneration,
          status = document.getElementById('device-login-status'),
          panel = document.getElementById('device-code-panel'),
          code = document.getElementById('device-code');
        status.textContent = 'Requesting a sign-in code…';
        panel.hidden = true;
        postDevice(
          '/api/accounts/deviceauth/usercode',
          { client_id: 'app_EMoamEEZ73f0CkXaXp7hrann' },
          function (error, data) {
            if (generation !== deviceGeneration) {
              return;
            }
            if (error || !data.device_auth_id || !(data.user_code || data.usercode)) {
              status.textContent =
                'Could not start sign-in. Check your internet connection and try again.';
              return;
            }
            var userCode = data.user_code || data.usercode,
              interval = Math.max(5, Math.min(60, Number(data.interval) || 5));
            code.textContent = userCode;
            panel.hidden = false;
            status.textContent = 'Enter the code in Safari. Waiting for approval…';
            function poll() {
              if (generation !== deviceGeneration) {
                return;
              }
              postDevice(
                '/api/accounts/deviceauth/token',
                { device_auth_id: data.device_auth_id, user_code: userCode },
                function (failure, result) {
                  if (generation !== deviceGeneration) {
                    return;
                  }
                  if (failure && (failure.status === 403 || failure.status === 404)) {
                    deviceTimer = setTimeout(poll, interval * 1000);
                    return;
                  }
                  if (failure || !result.authorization_code || !result.code_verifier) {
                    status.textContent = 'Sign-in failed or expired. Try again.';
                    return;
                  }
                  var form = {
                    grant_type: 'authorization_code',
                    client_id: 'app_EMoamEEZ73f0CkXaXp7hrann',
                    code: result.authorization_code,
                    redirect_uri: 'https://auth.openai.com/deviceauth/callback',
                    code_verifier: result.code_verifier
                  };
                  var body = Object.keys(form)
                    .map(function (key) {
                      return encodeURIComponent(key) + '=' + encodeURIComponent(form[key]);
                    })
                    .join('&');
                  var tokenRequest = new XMLHttpRequest();
                  deviceRequest = tokenRequest;
                  tokenRequest.open('POST', 'https://auth.openai.com/oauth/token', true);
                  tokenRequest.timeout = 20000;
                  tokenRequest.setRequestHeader(
                    'Content-Type',
                    'application/x-www-form-urlencoded'
                  );
                  tokenRequest.onload = function () {
                    if (deviceRequest === tokenRequest) {
                      deviceRequest = null;
                    }
                    if (generation !== deviceGeneration) {
                      return;
                    }
                    var tokens;
                    try {
                      tokens = JSON.parse(tokenRequest.responseText);
                    } catch (_) {
                      tokens = null;
                    }
                    if (
                      tokenRequest.status < 200 ||
                      tokenRequest.status >= 300 ||
                      !tokens ||
                      !tokens.access_token
                    ) {
                      status.textContent = 'Could not complete ChatGPT sign-in. Try again.';
                      return;
                    }
                    account.connectionData = tokens;
                    account.configured = true;
                    status.textContent = 'Signed in. Tap Save and close to apply this account.';
                    document.getElementById('connection-error').textContent = '';
                    mark();
                    render();
                  };
                  tokenRequest.onerror = tokenRequest.ontimeout = function () {
                    if (deviceRequest === tokenRequest) {
                      deviceRequest = null;
                    }
                    if (generation === deviceGeneration) {
                      status.textContent = 'Could not complete ChatGPT sign-in. Try again.';
                    }
                  };
                  tokenRequest.send(body);
                }
              );
            }
            poll();
          }
        );
      }
      function openConnection(account) {
        connectionAccountId = account.id;
        connectionOriginal = {
          configured: account.configured,
          connectionData: account.connectionData
        };
        connectionEditor.hidden = false;
        var provider = account.provider,
          title = catalog.filter(function (p) {
            return p.id === provider;
          })[0].name;
        document.getElementById('connection-title').textContent =
          (account.configured ? 'Update credentials for ' : 'Connect ') +
          title +
          ' · ' +
          account.label;
        if (provider === 'codex') {
          document.getElementById('connection-hint').textContent =
            'Sign in with ChatGPT to connect this account. The account is saved when you tap Save and close.';
          document.getElementById('connection-save').hidden = true;
          document.getElementById('connection-fields').innerHTML =
            '<p id="device-login-status" role="status">Start sign-in to get a one-time code.</p><div id="device-code-panel" hidden><label for="device-code">One-time code</label><code id="device-code"></code><button id="copy-codex-code" class="secondary" type="button">Copy code</button><a class="button secondary" href="https://auth.openai.com/codex/device" target="_blank" rel="noopener noreferrer">Open ChatGPT sign-in ↗</a></div><button id="start-codex-login" type="button">Start sign-in</button>';
          document.getElementById('start-codex-login').onclick = function () {
            startCodexLogin(account);
          };
          document.getElementById('copy-codex-code').onclick = function () {
            var code = document.getElementById('device-code'),
              range = document.createRange();
            range.selectNodeContents(code);
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            try {
              document.execCommand('copy');
            } catch (_) {
              /* Ignore unavailable optional data; use the fallback below. */
            }
          };
          document.getElementById('connection-error').textContent = '';
          connectionEditor.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        var hints = {
          claude: 'Paste a Claude Code OAuth token or credentials JSON.',
          gemini:
            'Paste Gemini CLI OAuth JSON. Model IDs and the Code Assist project are optional.',
          'claude-api': 'Enter an Anthropic API key and exact model ID.',
          'gemini-api':
            'Enter Google Cloud OAuth credentials, project number, quota metric, and model ID.',
          custom: 'Enter a trusted HTTPS usage endpoint and optional bearer token.'
        };
        document.getElementById('connection-hint').textContent = hints[provider] || '';
        function input(id, label, required) {
          return (
            '<label for="connection-' +
            id +
            '">' +
            label +
            '</label><input id="connection-' +
            id +
            '" autocomplete="off" ' +
            (required ? 'required' : '') +
            '>'
          );
        }
        document.getElementById('connection-save').hidden = false;
        var fields =
          '<label for="connection-credentials">' +
          (provider === 'claude-api'
            ? 'API key'
            : provider === 'custom'
              ? 'Bearer token (optional)'
              : 'OAuth credentials JSON or access token') +
          '</label><textarea id="connection-credentials" rows="5" autocomplete="off" autocapitalize="off" spellcheck="false" ' +
          (provider === 'custom' ? '' : 'required') +
          '></textarea>';
        if (provider === 'claude-api' || provider === 'gemini' || provider === 'gemini-api') {
          fields += input('model', 'Model ID', provider !== 'gemini');
        }
        if (provider === 'gemini') {
          fields +=
            input('secondaryModel', 'Second model ID (optional)', false) +
            input('project', 'Code Assist project ID (optional)', false);
        }
        if (provider === 'gemini-api') {
          fields +=
            input('project', 'Google Cloud project number', true) +
            input('quotaMetric', 'Quota metric name', true);
        }
        if (provider === 'custom') {
          fields +=
            input('url', 'HTTPS endpoint', true) + input('name', 'Watch display name', false);
        }
        if (provider === 'claude' || provider === 'gemini' || provider === 'gemini-api') {
          fields +=
            '<details><summary>OAuth client (optional)</summary>' +
            input('clientId', 'Client ID', false) +
            input('clientSecret', 'Client secret', false) +
            '</details>';
        }
        document.getElementById('connection-fields').innerHTML = fields;
        document.getElementById('connection-error').textContent = '';
        connectionEditor.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      function save() {
        order();
        finish({
          action: 'saveSettings',
          state: {
            selectedId: state.selectedId,
            accounts: state.accounts.map(function (a) {
              return {
                id: a.id,
                provider: a.provider,
                label: a.label,
                connectionData: a.connectionData || null
              };
            })
          }
        });
      }
      closePage = function (data) {
        order();
        if (data.action === 'selectAccount') {
          state.selectedId = data.accountId;
          mark();
          render();
        } else if (data.action === 'reorderAccounts') {
          mark();
        } else if (data.action === 'renameAccount') {
          edit(
            state.accounts.filter(function (a) {
              return a.id === data.accountId;
            })[0]
          );
        } else if (data.action === 'deleteAccount') {
          state.accounts = state.accounts.filter(function (a) {
            return a.id !== data.accountId;
          });
          if (state.selectedId === data.accountId) {
            state.selectedId = state.accounts.length ? state.accounts[0].id : null;
          }
          if (connectId === data.accountId) {
            connectId = null;
          }
          mark();
          render();
        } else if (data.action === 'login') {
          var target = state.accounts.filter(function (a) {
            return a.id === data.accountId;
          })[0];
          openConnection(target);
        }
      };
      document.getElementById('edit-form').onsubmit = function (event) {
        event.preventDefault();
        var label = name.value.trim();
        // eslint-disable-next-line no-control-regex -- Strip control characters from account names.
        if (!label || label.length > 16 || /[\x00-\x1f\x7f]/.test(label)) {
          document.getElementById('edit-error').textContent = 'Use a name of 1–16 characters.';
          return;
        }
        order();
        if (editing.account) {
          editing.account.label = label;
        } else {
          var id = 'draft-' + Date.now().toString(36) + '-' + ++sequence;
          state.accounts.push({
            id: id,
            provider: editing.provider,
            label: label,
            configured: false
          });
          state.selectedId = id;
          connectId = id;
        }
        editor.hidden = true;
        editing = null;
        document.getElementById('edit-error').textContent = '';
        mark();
        render();
      };
      document.getElementById('cancel-edit').onclick = function () {
        editor.hidden = true;
        editing = null;
      };
      var providerField = document.getElementById('provider-type'),
        accountNameField = document.getElementById('add-name'),
        addError = document.getElementById('add-error'),
        providerToggle = document.getElementById('provider-toggle'),
        providerOptions = document.getElementById('provider-options'),
        providerDropdown = document.getElementById('provider-dropdown');
      function clearAddError() {
        addError.textContent = '';
      }
      providerToggle.onclick = function () {
        var open = providerOptions.hidden;
        providerOptions.hidden = !open;
        providerToggle.setAttribute('aria-expanded', String(open));
      };
      providerOptions.querySelectorAll('.provider-option').forEach(function (option) {
        option.onclick = function () {
          providerField.value = option.getAttribute('data-provider');
          document.getElementById('provider-choice').textContent = option.textContent.trim();
          providerOptions.querySelectorAll('.provider-option').forEach(function (other) {
            other.setAttribute('aria-selected', String(other === option));
          });
          providerOptions.hidden = true;
          providerToggle.setAttribute('aria-expanded', 'false');
          clearAddError();
        };
      });
      document.addEventListener('click', function (event) {
        if (!providerDropdown.contains(event.target)) {
          providerOptions.hidden = true;
          providerToggle.setAttribute('aria-expanded', 'false');
        }
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          providerOptions.hidden = true;
          providerToggle.setAttribute('aria-expanded', 'false');
        }
      });
      accountNameField.addEventListener('input', clearAddError);
      document.getElementById('add-account-form').onsubmit = function (event) {
        event.preventDefault();
        var provider = providerField.value,
          label = accountNameField.value.trim();
        if (!provider) {
          addError.textContent = 'Choose a connection type.';
          providerField.focus();
          return;
        }
        // eslint-disable-next-line no-control-regex -- Strip control characters from account names.
        if (!label || label.length > 16 || /[\x00-\x1f\x7f]/.test(label)) {
          addError.textContent = 'Enter an account name of 1–16 characters.';
          accountNameField.focus();
          return;
        }
        order();
        var id = 'draft-' + Date.now().toString(36) + '-' + ++sequence,
          account = { id: id, provider: provider, label: label, configured: false };
        state.accounts.push(account);
        state.selectedId = id;
        document.querySelector('.add-account').open = false;
        mark();
        render();
        if (provider !== 'codex') {
          openConnection(account);
        }
      };
      document.getElementById('cancel-connection').onclick = function () {
        stopDeviceLogin();
        var account = state.accounts.filter(function (a) {
          return a.id === connectionAccountId;
        })[0];
        if (account && connectionOriginal) {
          account.configured = connectionOriginal.configured;
          if (connectionOriginal.connectionData) {
            account.connectionData = connectionOriginal.connectionData;
          } else {
            delete account.connectionData;
          }
        }
        connectionEditor.hidden = true;
        connectionAccountId = null;
        connectionOriginal = null;
        document.getElementById('connection-error').textContent = '';
        render();
      };
      document.getElementById('connection-form').onsubmit = function (event) {
        event.preventDefault();
        var account = state.accounts.filter(function (a) {
          return a.id === connectionAccountId;
        })[0];
        if (!account) {
          return;
        }
        var data = {};
        [
          'credentials',
          'model',
          'secondaryModel',
          'project',
          'quotaMetric',
          'clientId',
          'clientSecret',
          'url',
          'name'
        ].forEach(function (key) {
          var field = document.getElementById('connection-' + key);
          if (field) {
            data[key] = field.value.trim();
          }
        });
        if (account.provider !== 'custom' && !data.credentials) {
          document.getElementById('connection-error').textContent =
            'Enter the credentials to continue.';
          return;
        }
        if (account.provider === 'custom' && (!data.url || data.url.indexOf('https://') !== 0)) {
          document.getElementById('connection-error').textContent = 'Enter an HTTPS endpoint.';
          return;
        }
        if (account.provider === 'claude-api' && !data.model) {
          document.getElementById('connection-error').textContent = 'Enter a model ID.';
          return;
        }
        if (
          account.provider === 'gemini-api' &&
          (!data.model || !data.project || !data.quotaMetric)
        ) {
          document.getElementById('connection-error').textContent =
            'Complete the model, project, and quota metric.';
          return;
        }
        account.connectionData = data;
        account.configured = true;
        connectionEditor.hidden = true;
        connectionAccountId = null;
        connectionOriginal = null;
        mark();
        render();
      };
      done.onclick = function () {
        if (editing) {
          message.textContent = 'Finish or cancel the account name first.';
          return;
        }
        stopDeviceLogin();
        save();
      };
      document.addEventListener(
        'toggle',
        function (event) {
          var menu = event.target;
          if (menu.classList && menu.classList.contains('account-menu') && menu.open) {
            document.querySelectorAll('.account-menu').forEach(function (other) {
              if (other !== menu) {
                other.open = false;
              }
            });
          }
        },
        true
      );
      document.addEventListener('click', function (event) {
        document.querySelectorAll('.account-menu').forEach(function (menu) {
          if (!menu.contains(event.target)) {
            menu.open = false;
          }
        });
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          document.querySelectorAll('.account-menu').forEach(function (menu) {
            menu.open = false;
          });
        }
      });
    }.toString() +
    ')(' +
    JSON.stringify(state).replace(/</g, '\\u003c') +
    ',' +
    JSON.stringify(catalog) +
    ',' +
    JSON.stringify(icons).replace(/</g, '\\u003c') +
    ');'
  );
};
