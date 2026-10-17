import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);

const createLogin = require('../src/pkjs/settings/device-login');
const createEditor = require('../src/pkjs/settings/connection-editor');
const loginPolicy = require('../src/pkjs/device-login-policy');
const serialize = require('../src/pkjs/settings/serialize');

function webview() {
  const requests = [];
  const elements = {};
  const timers = new Map();
  let marks = 0;
  let renders = 0;
  let nextTimer = 0;
  let now = 0;
  const login = vm.runInNewContext(serialize.source(createLogin), {
    Date: { now: () => now },
    document: {
      getElementById(id) {
        if (!elements[id]) {
          elements[id] = {};
        }

        return elements[id];
      }
    },
    XMLHttpRequest: function () {
      requests.push(this);
      this.open = () => {};

      this.setRequestHeader = () => {};

      this.send = () => {};

      this.abort = () => {
        this.aborted = true;
      };
    },
    setTimeout(fn) {
      timers.set(++nextTimer, fn);

      return nextTimer;
    },
    clearTimeout(id) {
      timers.delete(id);
    }
  })(
    () => marks++,
    () => renders++,
    loginPolicy()
  );

  function reply(index, status, data) {
    Object.assign(requests[index], { status, responseText: JSON.stringify(data) });
    requests[index].onload();
  }

  function approve() {
    reply(0, 200, { device_auth_id: 'device', user_code: 'CODE', interval: 5 });
    reply(1, 200, { authorization_code: 'approved', code_verifier: 'verifier' });
  }

  return {
    login,
    requests,
    timers,
    reply,
    approve,
    advance(ms) {
      now += ms;
    },
    changes: () => [marks, renders]
  };
}

test('serialized WebView login stages tokens on the draft without companion dependencies', () => {
  const view = webview();
  const account = { id: 'draft' };

  view.login.start(account);
  view.approve();
  view.reply(2, 200, { access_token: 'staged', refresh_token: 'rotated' });
  assert.equal(account.configured, true);
  assert.equal(account.connectionData.access_token, 'staged');
  assert.deepEqual(view.changes(), [1, 1]);
});

test('cancelling inline login aborts exchange and ignores a late token response', () => {
  const view = webview();
  const account = { id: 'draft' };

  view.login.start(account);
  view.approve();
  view.login.stop();
  assert.equal(view.requests[2].aborted, true);
  view.reply(2, 200, { access_token: 'late' });
  assert.equal(account.connectionData, undefined);
  assert.deepEqual(view.changes(), [0, 0]);
});

test('cancelling pending approval removes its poll timer', () => {
  const view = webview();

  view.login.start({ id: 'draft' });
  view.reply(0, 200, { device_auth_id: 'device', user_code: 'CODE' });
  view.reply(1, 403, {});
  assert.equal(view.timers.size, 1);
  view.login.stop();
  assert.equal(view.timers.size, 0);
});

test('inline login does not send another poll after its deadline', () => {
  const view = webview();

  view.login.start({ id: 'draft' });
  view.reply(0, 200, { device_auth_id: 'device', user_code: 'CODE', interval: 5 });
  view.reply(1, 403, {});
  view.advance(16 * 60 * 1000);
  view.timers.values().next().value();
  assert.equal(view.requests.length, 2);
});

test('switching accounts cancels the previous login before a late response can stage changes', () => {
  const view = webview();
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) {
        elements.set(id, {});
      }

      return elements.get(id);
    }
  };
  const editorFactory = vm.runInNewContext(serialize.source(createEditor), { document });
  const first = { id: 'a', provider: 'codex', configured: false };
  const second = { id: 'b', provider: 'codex', configured: false };
  const state = { accounts: [first, second] };
  const open = editorFactory(
    state,
    [],
    view.login,
    () => {},
    () => {},
    () => {},
    () => null
  );

  open(first);
  view.login.start(first);
  view.approve();
  open(second);
  assert.equal(view.requests[2].aborted, true);
  view.reply(2, 200, { access_token: 'late' });
  elements.get(createEditor.constants.ID_CANCEL_CONNECTION).onclick();
  assert.equal(first.configured, false);
  assert.equal(first.connectionData, undefined);
  assert.equal(second.configured, false);
});
