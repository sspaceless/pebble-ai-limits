import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

function transport() {
  const requests = [];
  const module = { exports: {} };

  vm.runInNewContext(
    readFileSync(new URL('../src/pkjs/network/http.js', import.meta.url), 'utf8'),
    {
      module,
      require: createRequire(new URL('../src/pkjs/network/http.js', import.meta.url)),
      XMLHttpRequest: function () {
        requests.push(this);
        this.open = () => {};

        this.setRequestHeader = () => {};

        this.send = () => {};
      }
    }
  );
  const reply = (index, status, body) => {
    Object.assign(requests[index], { status, responseText: body });
    requests[index].onload();
  };

  return { ...module.exports, requests, reply };
}

test('cancelling login leaves usage requests and subsequent login attempts active', () => {
  const http = transport();
  const results = [];

  http.request('GET', 'https://example.com', null, {}, () => results.push('old'), 'login');
  http.request('GET', 'https://example.com', null, {}, () => results.push('usage'));
  http.cancel('login');
  http.request('GET', 'https://example.com', null, {}, () => results.push('new'), 'login');
  http.reply(0, 200, '{}');
  http.reply(1, 200, '{}');
  http.reply(2, 200, '{}');
  assert.deepEqual(results, ['usage', 'new']);
});

test('transport completes once and exposes only sanitized errors', () => {
  const http = transport();
  const errors = [];

  http.request('GET', 'https://example.com', null, {}, (error) => errors.push(error));
  http.reply(
    0,
    403,
    JSON.stringify({
      secret: 'private-response',
      error: { details: [{ reason: 'SUBSCRIPTION_REQUIRED' }] }
    })
  );
  http.requests[0].ontimeout();
  http.requests[0].onerror();
  assert.equal(errors.length, 1);
  assert.equal(errors[0].status, 403);
  assert.equal(errors[0].reason, 'SUBSCRIPTION_REQUIRED');
  assert.ok(!JSON.stringify(errors).includes('private-response'));
});

test('malformed success JSON reports invalid data', () => {
  const http = transport();
  let error;

  http.request('GET', 'https://example.com', null, {}, (result) => {
    error = result;
  });
  http.reply(0, 200, '<html>Unavailable</html>');
  assert.equal(error.invalidData, true);
});
