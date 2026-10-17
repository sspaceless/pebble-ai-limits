import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import config from '../eslint.config.mjs';

const policy = config.find((entry) => entry.rules?.['no-magic-numbers']).rules;

function check(code) {
  return new Linter().verify(code, {
    languageOptions: { ecmaVersion: 5, sourceType: 'commonjs' },
    rules: policy
  });
}

test('built-in constant policy rejects policy numbers, endpoints, statuses, IDs and commands in runtime code', () => {
  for (const code of [
    'setTimeout(run, 25000);',
    '/^AIza/.test(token);',
    "http('GET', url);",
    "status('Try again later');",
    "document.getElementById('account-editor');",
    "if (action === 'saveSettings') { save(); }"
  ]) {
    assert.equal(check(code).length, 1, code);
  }
});

test('built-in constant policy accepts named values and structural language literals', () => {
  assert.deepEqual(check("var C = require('./resources/example'); var count = 0;"), []);
  assert.deepEqual(check("if (typeof value === 'string' && value !== '') { count += 1; }"), []);
  assert.deepEqual(check("var schema = { 'wire-field': C.VALUE }; var index = -1;"), []);
  assert.deepEqual(check('setTimeout(run, C.REQUEST_TIMEOUT_MS);'), []);
});
