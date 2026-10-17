// Read-only quota check. Never prints credentials or writes to Gemini's credential store.
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const { geminiUsage } = createRequire(import.meta.url)('../src/pkjs/providers.js');
async function json(url, body, token) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {})
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000)
  });
  if (!response.ok) {
    const stage = url.includes('oauth2')
      ? 'token refresh'
      : url.includes('loadCodeAssist')
        ? 'loadCodeAssist'
        : 'retrieveUserQuota';
    let reason = '';
    try {
      const data = await response.json();
      reason = (data.error?.details || [])
        .map((d) => d.reason)
        .filter((r) => typeof r === 'string' && /^[A-Z_]+$/.test(r))
        .join(',');
    } catch {
      /* Try the next local credential location. */
    }
    throw new Error(
      'Gemini quota check HTTP ' +
        response.status +
        ' at ' +
        stage +
        (reason ? ' (' + reason + ')' : '')
    );
  }
  return response.json();
}
try {
  const saved = JSON.parse(await readFile(join(homedir(), '.gemini', 'oauth_creds.json'), 'utf8'));
  let access = saved.access_token;
  if (!access || !saved.expiry_date || saved.expiry_date < Date.now() + 60000) {
    if (!saved.refresh_token) {
      throw new Error('No refreshable Gemini session');
    }
    const renewed = await json('https://oauth2.googleapis.com/token', {
      grant_type: 'refresh_token',
      refresh_token: saved.refresh_token,
      client_id: '681255809395-oo8ft2oprdrnp9e3aqf6av3hmdib135j.apps.googleusercontent.com',
      client_secret: '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'
    });
    access = renewed.access_token;
  }
  const base = 'https://cloudcode-pa.googleapis.com/v1internal:';
  const loaded = await json(
    base + 'loadCodeAssist',
    {
      mode: 'HEALTH_CHECK',
      metadata: {
        ideType: 'IDE_UNSPECIFIED',
        platform: 'PLATFORM_UNSPECIFIED',
        pluginType: 'GEMINI'
      }
    },
    access
  );
  const project =
    typeof loaded.cloudaicompanionProject === 'string'
      ? loaded.cloudaicompanionProject
      : loaded.cloudaicompanionProject?.id;
  if (!project) {
    throw new Error('No Code Assist project returned');
  }
  const payload = await json(base + 'retrieveUserQuota', { project }, access);
  const result = geminiUsage(payload, {});
  console.log(
    JSON.stringify({
      success: true,
      models: (payload.buckets || []).length,
      primaryAvailable: result.primary.left >= 0,
      secondaryAvailable: result.secondary.left >= 0
    })
  );
} catch (error) {
  console.error(
    error.message.startsWith('Gemini quota check HTTP') || error.message.startsWith('No ')
      ? error.message
      : 'Gemini quota check failed'
  );
  process.exitCode = 1;
}
