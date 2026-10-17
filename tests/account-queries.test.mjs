import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function queries(state) {
  let reads = 0;
  const module = { exports: {} };

  vm.runInNewContext(
    readFileSync(new URL('../src/pkjs/accounts/queries.js', import.meta.url), 'utf8'),
    {
      module,
      require: () => ({
        load: () => {
          reads++;

          return JSON.parse(JSON.stringify(state));
        }
      })
    }
  );

  return { api: module.exports, reads: () => reads };
}

test('profile queries read storage once per operation and keep credentials private in views', () => {
  const state = {
    selectedId: 'work',
    accounts: [
      { id: 'home', provider: 'codex', label: 'Home', config: null },
      { id: 'work', provider: 'claude', label: 'Work', config: { accessToken: 'secret' } }
    ]
  };
  const q = queries(state);

  assert.equal(q.api.current().id, 'work');
  assert.equal(q.reads(), 1);
  const view = q.api.view();

  assert.equal(q.reads(), 2);
  assert.deepEqual(JSON.parse(JSON.stringify(view)), {
    selectedId: 'work',
    accounts: [
      { id: 'home', provider: 'codex', label: 'Home', configured: false },
      { id: 'work', provider: 'claude', label: 'Work', configured: true }
    ]
  });
  assert.equal(q.api.get('missing'), null);
  assert.equal(q.reads(), 3);
  state.selectedId = 'home';
  assert.equal(q.api.current().id, 'home');
  assert.equal(q.reads(), 4);
});

test('missing selection falls back to the first account with one storage read', () => {
  const q = queries({ selectedId: 'removed', accounts: [{ id: 'first' }] });

  assert.equal(q.api.current().id, 'first');
  assert.equal(q.reads(), 1);
  assert.equal(q.api.view().selectedId, 'first');
  assert.equal(q.reads(), 2);
});

test('empty watch delivery queue does not read profiles after acknowledgement', () => {
  const module = { exports: {} };
  const account = { id: 'work', revision: 1, label: 'Work' };
  let reads = 0;
  let acknowledge;
  const sent = [];

  vm.runInNewContext(
    readFileSync(new URL('../src/pkjs/companion/watch-outbox.js', import.meta.url), 'utf8'),
    {
      module,
      require: (name) =>
        name === '../accounts'
          ? {
              current: () => {
                reads++;

                return account;
              }
            }
          : (message) => message,
      Pebble: {
        sendAppMessage: (message, ack) => {
          sent.push(message);
          acknowledge = ack;
        }
      }
    }
  );
  module.exports({ ACCOUNT_ID: 'work', ACCOUNT_REV: 1 });
  assert.equal(reads, 1);
  acknowledge();
  assert.equal(reads, 1);
  module.exports({ ACCOUNT_ID: 'removed', ACCOUNT_REV: 1 });
  assert.equal(sent.length, 1);
  assert.equal(reads, 2);
});
