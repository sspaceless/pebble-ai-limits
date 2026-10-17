import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {normalizeUsage, tokens} = createRequire(import.meta.url)('../src/pkjs/direct.js');
test('direct API unavailable quota is preserved and unexpected payloads are rejected', () => {
  assert.throws(() => normalizeUsage({}));
  assert.equal(normalizeUsage({rate_limit: null}).primary.left, -1);
  const data = normalizeUsage({rate_limit: {primary_window: {used_percent: null, reset_at: null}, secondary_window: {used_percent: 120, limit_window_seconds: 604800, reset_at: 2000000000}}});
  assert.equal(data.primary.left, -1); assert.equal(data.primary.resetsAt, 0);
  assert.equal(data.secondary.left, 0);
});
test('invalid token responses never overwrite valid credentials', () => {
  assert.throws(() => tokens({})); assert.throws(() => tokens({access_token: 'not-a-jwt'}));
});
test('Codex plan is read from reported metadata and missing plans remain absent',()=>{
 assert.equal(normalizeUsage({rate_limit:null,plan_type:'plus'}).plan,'Plus');
 assert.equal(normalizeUsage({rate_limit:null}).plan,'');
});
