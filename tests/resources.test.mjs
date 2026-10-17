import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);

const serialize = require('../src/pkjs/settings/serialize');

function resources(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const url = new URL(entry.name, directory);

    return entry.isDirectory() ? resources(new URL(entry.name + '/', directory)) : [url];
  });
}

test('every exported resource is defined and safe to serialize into a browser factory', () => {
  for (const url of resources(new URL('../src/pkjs/resources/', import.meta.url))) {
    if (!url.pathname.endsWith('.js')) {
      continue;
    }

    const values = require(url.pathname);

    for (const [key, value] of Object.entries(values)) {
      assert.ok(
        typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value)),
        url.pathname + ': ' + key
      );
    }

    assert.doesNotThrow(() => JSON.stringify(values));
  }
});

test('browser serialization preserves untrusted text without creating script tags', () => {
  const C = { text: '</script><script>bad()</script>\n"<&' };

  function factory(value) {
    return C.text + value;
  }

  factory.constants = C;
  const script = serialize(factory, ['<draft>']);

  assert.ok(!script.includes('</script>'));
  assert.equal(vm.runInNewContext(script), C.text + '<draft>');
});

test('rendered name limits and browser validation follow the canonical account contract', () => {
  const limits = require('../src/pkjs/resources/shared/limits');
  const validName = require('../src/pkjs/validation/account-name');
  const pages = require('../src/pkjs/config');

  const browserValidator = vm.runInNewContext(serialize.source(validName));

  for (const name of [
    '',
    'Office',
    'x'.repeat(limits.ACCOUNT_NAME_MAX_LENGTH),
    'x'.repeat(limits.ACCOUNT_NAME_MAX_LENGTH + 1),
    'bad\nname'
  ]) {
    assert.equal(validName(name), browserValidator(name));
  }

  assert.ok(
    pages.accountName('codex').includes('maxlength="' + limits.ACCOUNT_NAME_MAX_LENGTH + '"')
  );
});
