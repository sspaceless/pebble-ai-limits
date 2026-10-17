import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);

const copyRuntime = require('../src/pkjs/settings/copy-script-runtime');
const serialize = require('../src/pkjs/settings/serialize');

async function copy(options) {
  const code = { textContent: 'ABCD' };
  const status = { textContent: 'Copy code' };
  const focus = { focus() {} };
  let selected = false;
  let appended = false;
  const document = {
    activeElement: focus,
    body: {
      appendChild() {
        appended = true;
      },
      removeChild() {
        appended = false;
      }
    },
    getElementById(id) {
      return id === 'device-code' ? code : status;
    },
    createElement() {
      return {
        style: {},
        focus() {},
        select() {},
        setSelectionRange() {}
      };
    },
    createRange() {
      return { selectNodeContents() {} };
    },
    execCommand() {
      if (options.throwFallback) {
        throw new Error('clipboard unavailable');
      }

      return options.fallbackResult;
    }
  };
  const window = {
    getSelection() {
      return {
        removeAllRanges() {},
        addRange() {
          selected = true;
        }
      };
    }
  };
  const navigator = options.clipboard ? { clipboard: { writeText: () => options.clipboard } } : {};
  const runtime = vm.runInNewContext(serialize.source(copyRuntime), {
    document,
    window,
    navigator,
    clearTimeout() {},
    setTimeout() {
      return 1;
    }
  });

  runtime();
  window.copyCode();
  await Promise.resolve();
  await Promise.resolve();

  return { status: status.textContent, selected, appended };
}

test('copy uses Clipboard API and reports success', async () => {
  const result = await copy({ clipboard: Promise.resolve() });

  assert.equal(result.status, 'Copied');
});

test('copy falls back to execCommand and reports fallback success', async () => {
  const result = await copy({
    clipboard: Promise.reject(new Error('denied')),
    fallbackResult: true
  });

  assert.equal(result.status, 'Copied');
  assert.equal(result.appended, false);
});

test('copy selects the code and reports failure when clipboard fallback fails', async () => {
  const result = await copy({ fallbackResult: false });

  assert.equal(result.status, 'Select code to copy');
  assert.equal(result.selected, true);
});
