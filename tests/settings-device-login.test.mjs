import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);

const createLogin = require('../src/pkjs/settings/device-login');
const serialize = require('../src/pkjs/settings/serialize');

function webview() {
  const requests = [];
  const elements = {};
  const timers = new Map();
  let marks = 0;
  let renders = 0;
  let nextTimer = 0;
  const login = vm.runInNewContext(serialize.source(createLogin), {
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
    () => renders++
  );

  function reply(index, status, data) {
    Object.assign(requests[index], { status, responseText: JSON.stringify(data) });
    requests[index].onload();
  }

  function approve() {
    reply(0, 200, { device_auth_id: 'device', user_code: 'CODE', interval: 5 });
    reply(1, 200, { authorization_code: 'approved', code_verifier: 'verifier' });
  }

  return { login, requests, timers, reply, approve, changes: () => [marks, renders] };
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
