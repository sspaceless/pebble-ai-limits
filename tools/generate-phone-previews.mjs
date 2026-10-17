import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);

const pages = require('../src/pkjs/config');

const SIZE = { width: 500, height: 1200 };
const OUTPUT = fileURLToPath(new URL('../preview/phone/', import.meta.url));
const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
];
const BROWSER = process.env.CHROME_BIN || CHROME_CANDIDATES.find((path) => existsSync(path));
const TIMEOUT_MS = 30000;
const MAX_BUFFER_BYTES = 1024 * 1024;
const DEMO_ID = 'demo-codex';
const DEMO_LABEL = 'Work';
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const DIMENSIONS_OFFSET = { width: 16, height: 20 };
const MEASUREMENT =
  '<script>document.documentElement.setAttribute("data-preview-height", String(document.documentElement.scrollHeight));document.documentElement.setAttribute("data-preview-width", String(document.documentElement.scrollWidth));</script>';

/** Capture the normal account-list UI after selecting a demonstration profile. */
function accountList(connected) {
  const state = {
    selectedId: DEMO_ID,
    accounts: [
      { id: DEMO_ID, provider: 'codex', label: DEMO_LABEL, configured: true },
      { id: 'demo-claude', provider: 'claude', label: 'Personal', configured: connected }
    ]
  };

  // Initial and subsequent list markup both preserve escaped account labels.
  return pages
    .settings(state)
    .replace(
      '</body>',
      '<script>closePage({action:"selectAccount",accountId:' +
        JSON.stringify(DEMO_ID) +
        '});</script></body>'
    );
}

/** Run an isolated browser against local HTML without loading personal browser state. */
function render(profile, page, options) {
  const result = spawnSync(
    BROWSER,
    [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--disable-background-networking',
      '--disable-sync',
      '--disable-extensions',
      '--force-device-scale-factor=1',
      '--user-data-dir=' + profile,
      '--window-size=' + SIZE.width + ',' + SIZE.height,
      ...options,
      pathToFileURL(page).href
    ],
    { encoding: 'utf8', timeout: TIMEOUT_MS, maxBuffer: MAX_BUFFER_BYTES }
  );

  if (result.error || result.status !== 0) {
    throw new Error('Browser capture failed: ' + (result.error?.message || result.status));
  }

  return result.stdout;
}

assert.ok(BROWSER, 'Install Chrome/Chromium or set CHROME_BIN to its executable.');

const temporary = await mkdtemp(join(tmpdir(), 'pebble-phone-previews-'));

try {
  const scenarios = {
    settings: accountList(false),
    connected: accountList(true),
    'add-account': pages.accountName('codex'),
    'rename-account': pages.accountName('codex', { id: DEMO_ID, label: DEMO_LABEL }),
    login: pages.device({ label: DEMO_LABEL, userCode: 'DEMO-ONLY' }),
    'claude-api': pages.credentials('claude-api', { id: 'demo-claude-api', label: DEMO_LABEL }),
    gemini: pages.credentials('gemini', { id: 'demo-gemini', label: DEMO_LABEL })
  };

  for (const [name, html] of Object.entries(scenarios)) {
    const page = join(temporary, name + '.html');
    const image = join(temporary, name + '.png');
    const profile = join(temporary, name + '-profile');

    await writeFile(page, html.replace('</body>', MEASUREMENT + '</body>'));
    const dom = render(profile, page, ['--dump-dom']);
    const height = dom.match(/data-preview-height="(\d+)"/);
    const width = dom.match(/data-preview-width="(\d+)"/);

    assert.ok(height && width, name + ': missing layout measurements');
    assert.ok(
      Number(height[1]) <= SIZE.height && Number(width[1]) <= SIZE.width,
      name + ': page exceeds the shared viewport; update SIZE for all phone captures.'
    );

    render(profile, page, ['--screenshot=' + image]);
    const bytes = await readFile(image);

    assert.ok(
      bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE),
      name + ': expected PNG'
    );
    assert.equal(
      bytes.readUInt32BE(DIMENSIONS_OFFSET.width),
      SIZE.width,
      name + ': incorrect width'
    );
    assert.equal(
      bytes.readUInt32BE(DIMENSIONS_OFFSET.height),
      SIZE.height,
      name + ': incorrect height'
    );
  }

  // Publish only after every scenario fits and all captures share the same format and size.
  await mkdir(OUTPUT, { recursive: true });

  for (const name of Object.keys(scenarios)) {
    await copyFile(join(temporary, name + '.png'), join(OUTPUT, name + '.png'));
  }

  console.log(
    'Generated ' +
      Object.keys(scenarios).length +
      ' phone previews: PNG ' +
      SIZE.width +
      'x' +
      SIZE.height +
      '.'
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
