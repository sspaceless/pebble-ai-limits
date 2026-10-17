// Read-only check. Credentials are sent only to OpenAI and never printed or written.
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { normalizeUsage } = require('../src/pkjs/direct.js');
try {
  const auth = JSON.parse(
    await readFile(join(process.env.CODEX_HOME || join(homedir(), '.codex'), 'auth.json'), 'utf8')
  );
  const token = auth.tokens?.access_token;
  const account = auth.tokens?.account_id;
  if (!token || !account) {
    throw new Error('No file-backed ChatGPT session; use device login on the phone');
  }
  const response = await fetch('https://chatgpt.com/backend-api/wham/usage', {
    headers: {
      Authorization: `Bearer ${token}`,
      'ChatGPT-Account-Id': account,
      'User-Agent': 'codex-cli',
      Accept: 'application/json'
    },
    signal: AbortSignal.timeout(25000)
  });
  if (!response.ok) {
    throw new Error(`Direct API returned HTTP ${response.status}`);
  }
  const payload = await response.json();
  const normalized = normalizeUsage(payload);
  console.log(
    JSON.stringify({
      success: true,
      planAvailable: !!normalized.plan,
      primaryAvailable: normalized.primary.left >= 0,
      secondaryAvailable: normalized.secondary.left >= 0
    })
  );
} catch (error) {
  // Avoid printing fetch errors or response bodies, which can contain account details.
  console.error(
    error.message.startsWith('Direct API') || error.message.startsWith('No file-backed')
      ? error.message
      : 'Direct API check failed'
  );
  process.exitCode = 1;
}
