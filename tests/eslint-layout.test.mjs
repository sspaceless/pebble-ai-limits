import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import eslintConfig from '../eslint.config.mjs';

const padding = eslintConfig.find((entry) => entry.rules?.['padding-line-between-statements'])
  .rules['padding-line-between-statements'];
const restrictions = eslintConfig.find((entry) => entry.rules?.['no-restricted-syntax']).rules[
  'no-restricted-syntax'
];

const config = {
  languageOptions: { ecmaVersion: 5, sourceType: 'commonjs' },
  rules: { 'padding-line-between-statements': padding, 'no-restricted-syntax': restrictions }
};

test('layout groups dependencies and export metadata while separating implementation', () => {
  const code = [
    "var first = require('./first');",
    "var second = require('./second').value;",
    '',
    'var state = {};',
    '',
    'module.exports = state;',
    'module.exports.constants = state;'
  ].join('\n');

  assert.deepEqual(new Linter().verify(code, config), []);
});

test('layout fixes blank lines before documented code and CommonJS exports', () => {
  const code =
    "var dependency = require('./dependency');\n/** Local state. */\nvar state = dependency;\nmodule.exports = state;";
  const fixed = new Linter().verifyAndFix(code, config);

  assert.deepEqual(fixed.messages, []);
  assert.equal(
    fixed.output,
    "var dependency = require('./dependency');\n\n/** Local state. */\nvar state = dependency;\n\nmodule.exports = state;"
  );
  assert.equal(new Linter().verifyAndFix(fixed.output, config).fixed, false);
});

test('layout rejects dependencies declared after implementation without moving side effects automatically', () => {
  const result = new Linter().verifyAndFix(
    "var state = {};\n\nvar dependency = require('./dependency');",
    config
  );

  assert.equal(result.messages.length, 1);
  assert.equal(result.messages[0].ruleId, 'no-restricted-syntax');
  assert.equal(result.fixed, false);
});
