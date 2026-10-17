import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const providers = createRequire(import.meta.url)('../src/pkjs/providers.js');
test('Claude subscription percentages and ISO/Unix reset timestamps', () => {
  const d = providers.claudeUsage({
    five_hour: { utilization: 25, resets_at: '2030-01-01T00:00:00Z' },
    seven_day: null
  });
  assert.equal(d.primary.left, 75);
  assert.equal(d.primary.resetsAt, 1893456000);
  assert.equal(d.secondary.left, -1);
  assert.equal(
    providers.claudeUsage({
      rate_limits: { five_hour: { used_percentage: 60, resets_at: 2000000000 } }
    }).primary.left,
    40
  );
  assert.throws(() => providers.claudeUsage({ credits: 100 }));
});
test('Gemini quotas select explicit models and the most restrictive shared bucket', () => {
  const d = providers.geminiUsage(
    {
      buckets: [
        { modelId: 'gemini-pro', remainingFraction: 0.8, resetTime: '2030-01-01T00:00:00Z' },
        { modelId: 'gemini-pro', remainingFraction: 0.3 },
        { modelId: 'gemini-flash', remainingFraction: 1 },
        { modelId: 'other', remainingFraction: 0 }
      ]
    },
    { model: 'gemini-pro', secondaryModel: 'gemini-flash' }
  );
  assert.equal(d.primary.left, 30);
  assert.equal(d.secondary.left, 100);
  const missing = providers.geminiUsage(
    { buckets: [{ modelId: 'gemini-pro', remainingFraction: null }] },
    { model: 'gemini-pro', secondaryModel: 'absent' }
  );
  assert.equal(missing.primary.left, -1);
  assert.equal(missing.secondary.left, -1);
});
test('Claude API displays configured caps, never fabricated remaining percentage', () => {
  const d = providers.claudeCaps(
    {
      data: [
        {
          models: ['model'],
          limits: [
            { type: 'requests_per_minute', value: 4000 },
            { type: 'input_tokens_per_minute', value: 10000000 }
          ]
        }
      ]
    },
    { model: 'model' }
  );
  assert.equal(d.primary.value, '4K');
  assert.equal(d.secondary.value, '10M');
  assert.equal(d.primary.left, -1);
  assert.equal(d.primary.resetsAt, 0);
  assert.equal(d.status, 'Configured caps');
  assert.throws(() =>
    providers.claudeCaps({ data: [{ models: ['different'], limits: [] }] }, { model: 'model' })
  );
});
test('Google API effective caps respect model overrides, units and ambiguous dimensions', () => {
  const p = {
    metrics: [
      {
        metric: 'quota/requests',
        consumerQuotaLimits: [
          {
            unit: '1/min/{project}/{model}',
            quotaBuckets: [
              { effectiveLimit: '10', dimensions: {} },
              { effectiveLimit: '30', dimensions: { model: 'test' } }
            ]
          },
          {
            unit: '1/d/{project}/{model}',
            quotaBuckets: [{ effectiveLimit: '1000', dimensions: { model: 'test' } }]
          }
        ]
      }
    ]
  };
  const d = providers.geminiCaps(p, { quotaMetric: 'quota/requests', model: 'test' });
  assert.equal(d.primary.value, '30');
  assert.equal(d.secondary.value, '1K');
  assert.equal(d.primary.left, -1);
  assert.throws(() => providers.geminiCaps(p, { quotaMetric: 'other', model: 'test' }));
  p.metrics[0].consumerQuotaLimits[0].quotaBuckets.push({
    effectiveLimit: '50',
    dimensions: { model: 'test' }
  });
  assert.throws(() => providers.geminiCaps(p, { quotaMetric: 'quota/requests', model: 'test' }));
});
test('imported credentials support Claude and Google formats without requiring access tokens for refresh-only Google ADC', () => {
  const c = providers.parseConfig('claude', {
    credentials: JSON.stringify({
      claudeAiOauth: { accessToken: 'access', refreshToken: 'refresh', expiresAt: 2000000000000 }
    })
  });
  assert.equal(c.expiresAt, 2000000000);
  assert.equal(c.refreshToken, 'refresh');
  const g = providers.parseConfig('gemini-api', {
    credentials: JSON.stringify({
      refresh_token: 'refresh',
      client_id: 'client',
      client_secret: 'secret'
    }),
    project: '123',
    model: 'model',
    quotaMetric: 'metric'
  });
  assert.equal(g.expiresAt, 1);
  assert.equal(g.clientId, 'client');
  assert.throws(() =>
    providers.parseConfig('gemini-api', {
      credentials: 'AIza-api-key',
      project: '123',
      model: 'model',
      quotaMetric: 'metric'
    })
  );
});
test('custom endpoint validation and snapshots preserve source freshness', () => {
  assert.throws(() => providers.parseConfig('custom', { url: 'http://example.com/usage' }));
  assert.throws(() =>
    providers.parseConfig('custom', { url: 'https://user:pass@example.com/usage' })
  );
  const d = providers.customUsage({
    primary: { left: 25, resetsAt: 2000000000 },
    secondary: { left: -1, resetsAt: 0 },
    updatedAt: 100
  });
  assert.equal(d.updatedAt, 100);
  assert.equal(d.secondary.left, -1);
  assert.throws(() =>
    providers.customUsage({ primary: { left: 150 }, secondary: { left: 1 }, updatedAt: 100 })
  );
});
