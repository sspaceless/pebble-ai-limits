import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const makeJwt = claims => 'header.' + Buffer.from(JSON.stringify(claims)).toString('base64url') + '.signature';
const authToken = makeJwt({exp: Math.floor(Date.now() / 1000) + 3600, 'https://api.openai.com/auth': {chatgpt_account_id: 'test-account'}});
const directConfig = {mode: 'direct', accessToken: authToken, refreshToken: 'old-refresh', accountId: 'test-account', expiresAt: Math.floor(Date.now() / 1000) + 3600};
const usage = {rate_limit: {primary_window: {used_percent: 20, reset_at: 2000000000, limit_window_seconds: 18000}, secondary_window: null}};
function profiles(p) {return JSON.parse(p.storage.get('ai-profiles-v2')).accounts;}
function profile(p,provider,label) {return profiles(p).find(a=>a.provider===provider&&(!label||a.label===label));}
function current(p) {var state=JSON.parse(p.storage.get('ai-profiles-v2'));return state.accounts.find(a=>a.id===state.selectedId);}
function phone(config, pending, delayAcks=false) {
  const events = {}, messages = [], requests = [], pages = [], acks=[], timers = new Map(), storage = new Map();
  let timerId = 0;
  const clock={ms:Date.now()};
  class ClockDate extends Date {static now(){return clock.ms;}}
  if (config) storage.set('codex-connection-v2', JSON.stringify(config));
  if (pending) storage.set('codex-device-login-v1', JSON.stringify(pending));
  const context = {
    localStorage: {getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key)},
    Pebble: {addEventListener: (name, fn) => {events[name] = fn;}, sendAppMessage: (data,ack) => {messages.push(data);if(delayAcks)acks.push(ack);else ack();}, openURL: url => pages.push(url)},
    XMLHttpRequest: function () {
      requests.push(this); this.headers = {};
      this.open = (method, url) => {this.method = method; this.url = url;};
      this.setRequestHeader = (key, value) => {this.headers[key] = value;};
      this.send = body => {this.body = body;};
    },
    setTimeout: fn => {timers.set(++timerId, fn); return timerId;}, clearTimeout: id => timers.delete(id),
    encodeURIComponent, decodeURIComponent, Date:ClockDate
  };
  const cache = {};
  context.require = name => {
    if (!cache[name]) {
      const module = {exports: {}};
      vm.runInNewContext(readFileSync(new URL('../src/pkjs/' + name.slice(2) + '.js', import.meta.url), 'utf8'), {...context, module, exports: module.exports});
      cache[name] = module.exports;
    }
    return cache[name];
  };
  vm.runInNewContext(readFileSync(new URL('../src/pkjs/index.js', import.meta.url), 'utf8'), context);
  const reply = (index, status, data) => {const xhr = requests[index]; xhr.status = status; xhr.responseText = JSON.stringify(data); xhr.onload();};
  const action = value => events.webviewclosed({response: encodeURIComponent(JSON.stringify(typeof value === 'string' ? {action: value} : value))});
  return {events, messages, requests, storage, pages, timers, reply, action, acks, clock};
}
test('unconfigured phone asks for settings without network requests', () => {
  const p = phone(); p.events.ready();
  assert.equal(p.messages[0].STATUS, 'Open app settings'); assert.equal(p.requests.length, 0);
});
test('watch keeps the provider name and reports the account count',()=>{
 const p=phone(directConfig);p.events.ready();
 assert.equal(p.messages.at(-1).PROVIDER_NAME,'Codex');assert.equal(p.messages.at(-1).ACCOUNT_COUNT,1);assert.equal(p.messages.at(-1).ACCOUNT_NAME,'Personal');
 p.reply(0,200,{...usage,plan_type:'plus'});
 assert.equal(p.messages.at(-1).PROVIDER_NAME,'Codex Plus');assert.equal(p.messages.at(-1).ACCOUNT_COUNT,1);
});
test('direct mode uses only the OpenAI usage endpoint and delivers snake-case quotas', () => {
  const p = phone(directConfig); p.events.ready(); p.events.appmessage();
  assert.equal(p.requests.length, 1); assert.equal(p.requests[0].url, 'https://chatgpt.com/backend-api/wham/usage');
  assert.equal(p.requests[0].headers.Authorization, 'Bearer ' + authToken);
  assert.equal(p.requests[0].headers['ChatGPT-Account-Id'], 'test-account');
  p.reply(0, 200, usage); assert.equal(p.messages.at(-1).P_LEFT, 80); assert.equal(p.messages.at(-1).P_LABEL, undefined); assert.equal(p.messages.at(-1).S_LEFT, -1);
});
test('401 refreshes once, persists rotated tokens, and retries with the new token', () => {
  const p = phone(directConfig); p.events.ready(); p.reply(0, 401, {});
  assert.equal(p.requests[1].url, 'https://auth.openai.com/oauth/token');
  assert.equal(JSON.parse(p.requests[1].body).refresh_token, 'old-refresh');
  const next = makeJwt({exp: 2000000000});
  p.reply(1, 200, {access_token: next, refresh_token: 'rotated-refresh'});
  assert.equal(profile(p,'codex').config.refreshToken, 'rotated-refresh');
  assert.equal(p.requests[2].headers.Authorization, 'Bearer ' + next);
  p.reply(2, 401, {}); assert.equal(p.requests.length, 3); assert.equal(p.messages.at(-1).STATUS, 'Sign in again');
});
test('expired credentials refresh before requesting usage', () => {
  const p = phone({...directConfig, expiresAt: 1}); p.events.ready();
  assert.equal(p.requests[0].url, 'https://auth.openai.com/oauth/token');
  p.requests[0].ontimeout(); assert.equal(p.messages.at(-1).STATUS, 'API unavailable');
  assert.ok(!!profile(p,'codex').config);
});
test('device login requests a code, exchanges approval, then reads usage', () => {
  const p = phone(); p.action('login');
  assert.equal(p.requests[0].url, 'https://auth.openai.com/api/accounts/deviceauth/usercode');
  p.reply(0, 200, {device_auth_id: 'device-id', user_code: 'ABCD-EFGH', interval: '5'});
  assert.ok(decodeURIComponent(p.pages[0]).includes('ABCD-EFGH'));
  p.action('finishLogin');
  assert.deepEqual(JSON.parse(p.requests[1].body), {device_auth_id: 'device-id', user_code: 'ABCD-EFGH'});
  p.reply(1, 200, {authorization_code: 'one-time-code', code_verifier: 'verifier'});
  const form = new URLSearchParams(p.requests[2].body);
  assert.equal(form.get('grant_type'), 'authorization_code'); assert.equal(form.get('redirect_uri'), 'https://auth.openai.com/deviceauth/callback');
  p.reply(2, 200, {access_token: authToken, refresh_token: 'phone-refresh', expires_in: 3600});
  assert.equal(p.storage.has('codex-device-login-v1'), false);
  assert.equal(profile(p,'codex').config.accountId, 'test-account');
  p.reply(3, 200, usage); assert.equal(p.messages.at(-1).P_LEFT, 80);
});
test('pending login resumes after restart and waits between approval polls', () => {
  const p = phone(null, {deviceAuthId: 'id', userCode: 'code', interval: 5, expiresAt: Date.now() + 60000});
  p.events.ready(); p.reply(0, 403, {}); assert.equal(p.timers.size, 1);
  p.events.appmessage(); assert.equal(p.requests.length, 1);
  const [id, fn] = p.timers.entries().next().value; p.timers.delete(id); fn(); assert.equal(p.requests.length, 2);
  p.action('cancelLogin'); p.reply(1, 200, {authorization_code: 'stale', code_verifier: 'stale'});
  // A stale device approval must not produce a token exchange after cancellation.
  assert.equal(!!profile(p,'codex').config, false);
  assert.equal(p.requests.length, 2);
});
test('expired device codes stop polling', () => {
  const p = phone(null, {deviceAuthId: 'id', userCode: 'code', interval: 5, expiresAt: 1}); p.events.ready();
  assert.equal(p.requests.length, 0); assert.equal(p.messages[0].STATUS, 'Login code expired');
});
test('logout prevents in-flight usage from updating the watch and removes phone credentials', () => {
  const p = phone(directConfig); p.events.ready(); p.action('logout'); p.reply(0, 200, usage);
  assert.equal(profiles(p).some(a=>a.config),false); assert.equal(p.messages.at(-1).STATUS, 'Open app settings');
  assert.equal(p.messages.some(m => m.UPDATED), false);
});
test('configuration contains no access or refresh tokens', () => {
  const p = phone(directConfig); p.events.showConfiguration();
  assert.equal(decodeURIComponent(p.pages[0]).includes(authToken), false);
  assert.equal(decodeURIComponent(p.pages[0]).includes('old-refresh'), false);
  const html = decodeURIComponent(p.pages[0].split(',')[1]);
  for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script[1]);
});
test('device-code page escapes server-provided HTML and contains valid JavaScript', () => {
  const p = phone(null, {deviceAuthId: 'id', userCode: '</code><script>alert(1)</script>', interval: 5, expiresAt: Date.now() + 60000});
  p.events.showConfiguration();
  const html = decodeURIComponent(p.pages[0].split(',')[1]);
  assert.equal(html.includes('<script>alert(1)</script>'), false);
  for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script[1]);
});
test('cancelled configuration does not fetch or overwrite settings', () => {
  const p = phone(); p.events.webviewclosed({response: 'CANCELLED'}); assert.equal(p.requests.length, 0);
});

test('switching provider ignores old responses and sends the correct credentials and header', () => {
  const p=phone(directConfig);p.events.ready();
  p.action({action:'saveProvider',provider:'claude',credentials:'claude-access'});
  assert.equal(p.requests[1].url,'https://api.anthropic.com/api/oauth/usage');
  assert.equal(p.requests[1].headers.Authorization,'Bearer claude-access');
  p.reply(0,200,usage);
  assert.equal(p.messages.some(m=>m.UPDATED),false);
  p.reply(1,200,{five_hour:{utilization:20,resets_at:2000000000},seven_day:{utilization:60,resets_at:2000000000}});
  assert.equal(p.messages.at(-1).PROVIDER,1);assert.equal(p.messages.at(-1).P_LEFT,80);
  p.events.appmessage({payload:{NAV:-1}});
  assert.equal(p.requests[2].headers.Authorization,'Bearer '+authToken);
  assert.equal(profile(p,'claude').config.accessToken,'claude-access');
});
test('API provider selects configured model caps without calling model generation',()=>{
  const p=phone();p.action({action:'saveProvider',provider:'claude-api',credentials:'admin-key',model:'model'});
  assert.equal(p.requests[0].method,'GET');assert.ok(p.requests[0].url.includes('/v1/organizations/rate_limits?model=model'));
  p.reply(0,200,{data:[{models:['model'],limits:[{type:'requests_per_minute',value:100},{type:'input_tokens_per_minute',value:1000}]}]});
  assert.equal(p.messages.at(-1).P_VALUE,'100');assert.equal(p.messages.at(-1).P_LEFT,-1);assert.equal(p.messages.at(-1).STATUS,'Configured caps');
});
test('Google quota pagination aggregates pages before model selection',()=>{
  const p=phone();p.action({action:'saveProvider',provider:'gemini-api',credentials:'google-access',project:'123',quotaMetric:'quota/requests',model:'model'});
  p.reply(0,200,{metrics:[],nextPageToken:'next'});
  assert.ok(p.requests[1].url.includes('&pageToken=next'));
  p.reply(1,200,{metrics:[{metric:'quota/requests',consumerQuotaLimits:[{unit:'1/min/{project}/{model}',quotaBuckets:[{effectiveLimit:'30',dimensions:{model:'model'}}]}]}]});
  assert.equal(p.messages.at(-1).P_VALUE,'30');assert.equal(p.messages.at(-1).PROVIDER,4);
});
test('non-Codex setup pages contain no saved credentials and all scripts compile',()=>{
  const p=phone(directConfig);p.action({action:'selectProvider',provider:'gemini'});p.action('login');
  assert.equal(p.requests.length,0);
  assert.ok(decodeURIComponent(p.pages.at(-1)).includes('Code Assist project ID'));
  assert.equal(decodeURIComponent(p.pages.at(-1)).includes(authToken),false);
  for(const page of p.pages){const html=decodeURIComponent(page.split(',')[1]);for(const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);}
});
test('Gemini discovers its Code Assist project and explains subscription-required errors',()=>{
 const p=phone();p.action({action:'saveProvider',provider:'gemini',credentials:'google-access'});
 assert.ok(p.requests[0].url.endsWith(':loadCodeAssist'));
 p.reply(0,200,{cloudaicompanionProject:'project-id'});
 assert.ok(p.requests[1].url.endsWith(':retrieveUserQuota'));
 assert.equal(JSON.parse(p.requests[1].body).project,'project-id');
 p.reply(1,403,{error:{details:[{reason:'SUBSCRIPTION_REQUIRED'}]}});
 assert.equal(p.messages.at(-1).STATUS,'Subscription required');
});
test('Gemini token renewal uses Google OAuth and retains provider metadata',()=>{
 const p=phone();p.action({action:'saveProvider',provider:'gemini',credentials:JSON.stringify({refresh_token:'google-refresh'}),project:'project-id',model:'gemini-pro'});
 assert.equal(p.requests[0].url,'https://oauth2.googleapis.com/token');
 const body=new URLSearchParams(p.requests[0].body);assert.equal(body.get('grant_type'),'refresh_token');assert.equal(body.get('refresh_token'),'google-refresh');
 p.reply(0,200,{access_token:'renewed-google',expires_in:3600});
 assert.equal(p.requests[1].headers.Authorization,'Bearer renewed-google');
 p.reply(1,200,{buckets:[{modelId:'gemini-pro',remainingFraction:0.5}]});
 const saved=profile(p,'gemini').config;
 assert.equal(saved.model,'gemini-pro');assert.equal(saved.project,'project-id');assert.equal(saved.refreshToken,'google-refresh');
});
test('migration preserves all legacy providers and the selected provider',()=>{
 const p=phone(directConfig);
 p.storage.set('ai-account-claude-v1',JSON.stringify({mode:'direct',accessToken:'legacy-claude'}));
 p.storage.set('ai-selected-v1',JSON.stringify('claude'));
 p.events.ready();
 assert.equal(profiles(p).length,2);assert.equal(current(p).provider,'claude');
 assert.equal(profile(p,'codex').config.accessToken,authToken);
 assert.equal(profile(p,'claude').config.accessToken,'legacy-claude');
 assert.equal(p.requests[0].headers.Authorization,'Bearer legacy-claude');
 assert.equal(p.storage.has('codex-connection-v2'),false);assert.equal(p.storage.has('ai-account-claude-v1'),false);
});
test('two accounts of one provider have separate credentials, cached quotas and watch identities',()=>{
 const p=phone(directConfig);
 p.action({action:'createAccount',provider:'claude',label:'Personal'});const personal=current(p);
 p.action({action:'saveProvider',provider:'claude',accountId:personal.id,credentials:'personal-token'});
 p.action({action:'createAccount',provider:'claude',label:'Work'});const work=current(p);
 p.action({action:'saveProvider',provider:'claude',accountId:work.id,credentials:'work-token'});
 assert.notEqual(personal.id,work.id);assert.equal(p.requests[0].headers.Authorization,'Bearer personal-token');assert.equal(p.requests[1].headers.Authorization,'Bearer work-token');
 p.reply(0,200,{five_hour:{utilization:20},seven_day:null});
 assert.equal(p.messages.some(m=>m.UPDATED),false);
 p.reply(1,200,{five_hour:{utilization:70},seven_day:null});
 assert.equal(p.messages.at(-1).ACCOUNT_ID,work.id);assert.equal(p.messages.at(-1).ACCOUNT_NAME,'Work');assert.equal(p.messages.at(-1).P_LEFT,30);
 p.events.appmessage({payload:{NAV:-1}});
 assert.equal(p.messages.at(-1).ACCOUNT_ID,personal.id);assert.equal(p.messages.at(-1).P_LEFT,80);
 assert.equal(p.requests[2].headers.Authorization,'Bearer personal-token');
 assert.equal(profile(p,'claude','Work').config.accessToken,'work-token');
});
test('renaming during a request preserves credentials and updates the displayed account name',()=>{
 const p=phone(directConfig);p.events.ready();const id=current(p).id;
 p.action({action:'saveName',accountId:id,label:'Office'});
 assert.equal(profile(p,'codex').config.accessToken,authToken);
 p.reply(0,200,usage);
 assert.equal(p.messages.at(-1).ACCOUNT_NAME,'Office');assert.equal(p.messages.at(-1).P_LEFT,80);
 assert.equal(current(p).snapshot.primary.left,80);
});
test('refresh token rotation is saved to the original account after switching away',()=>{
 const p=phone(directConfig);p.events.ready();const original=current(p).id;
 p.reply(0,401,{});
 p.action({action:'createAccount',provider:'claude',label:'Work'});const work=current(p).id;
 p.action({action:'saveProvider',provider:'claude',accountId:work,credentials:'work-token'});
 const renewed=makeJwt({exp:2000000000});p.reply(1,200,{access_token:renewed,refresh_token:'rotated-personal'});
 assert.equal(profile(p,'codex').config.refreshToken,'rotated-personal');assert.equal(current(p).id,work);
 p.reply(3,200,usage);
 assert.equal(p.messages.some(m=>m.UPDATED),false);
 p.action({action:'selectAccount',accountId:original});
 assert.equal(p.requests[4].headers.Authorization,'Bearer '+renewed);
 assert.equal(p.messages.at(-1).ACCOUNT_ID,original);
});
test('deleting an account during renewal cannot restore it or affect another account',()=>{
 const p=phone(directConfig);p.events.ready();const id=current(p).id;p.reply(0,401,{});
 p.action({action:'deleteAccount',accountId:id});p.reply(1,200,{access_token:authToken,refresh_token:'late-refresh'});
 assert.equal(profiles(p).some(a=>a.id===id),false);assert.equal(profiles(p).some(a=>a.config),false);
 assert.equal(p.requests.length,2);assert.equal(p.messages.some(m=>m.UPDATED),false);
});
test('Codex device login remains bound to its account while another account is selected',()=>{
 const p=phone(directConfig);p.events.ready();const personal=current(p).id;
 p.action({action:'createAccount',provider:'codex',label:'Work'});const work=current(p).id;
 p.reply(1,200,{device_auth_id:'device-work',user_code:'WORK-CODE',interval:'5'});
 assert.equal(JSON.parse(p.storage.get('codex-device-login-v1')).profileId,work);
 p.action('finishLogin');p.reply(2,200,{authorization_code:'work-code',code_verifier:'work-verifier'});
 p.action({action:'selectAccount',accountId:personal});
 const workToken=makeJwt({exp:2000000000,'https://api.openai.com/auth':{chatgpt_account_id:'backend-work'}});
 p.reply(3,200,{access_token:workToken,refresh_token:'work-refresh'});
 assert.equal(current(p).id,personal);assert.equal(profile(p,'codex','Personal').config.accessToken,authToken);
 assert.equal(profile(p,'codex','Work').config.accessToken,workToken);assert.equal(profile(p,'codex','Work').config.accountId,'backend-work');
 p.action({action:'selectAccount',accountId:work});
 assert.equal(p.requests[4].headers.Authorization,'Bearer '+workToken);assert.equal(p.requests[4].headers['ChatGPT-Account-Id'],'backend-work');
});
test('account setup and rename pages escape names, keep credentials out, and compile scripts',()=>{
 const p=phone(directConfig);p.events.ready();const id=current(p).id;
 p.action({action:'saveName',accountId:id,label:'<img src=x>'});
 p.action({action:'renameAccount',accountId:id});
 p.action({action:'addAccount',provider:'gemini'});
 for(const page of p.pages){const html=decodeURIComponent(page.split(',')[1]);assert.equal(html.includes(authToken),false);assert.equal(html.includes('<img src=x>'),false);for(const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);}
});
test('new credentials for an account ignore late responses from its previous credentials',()=>{
 const p=phone();p.action({action:'saveProvider',provider:'claude',credentials:'old-token'});const id=current(p).id;
 p.action({action:'saveProvider',provider:'claude',accountId:id,credentials:'new-token'});
 assert.equal(p.requests.length,2);assert.equal(p.messages.at(-1).ACCOUNT_REV,2);p.reply(0,200,{five_hour:{utilization:99},seven_day:null});
 assert.equal(p.messages.some(m=>m.UPDATED),false);assert.equal(profile(p,'claude').config.accessToken,'new-token');
 p.reply(1,200,{five_hour:{utilization:20},seven_day:null});assert.equal(p.messages.at(-1).P_LEFT,80);
});
test('migration binds an old pending Codex login without changing a different selected provider',()=>{
 const p=phone(null,{deviceAuthId:'id',userCode:'code',interval:5,expiresAt:Date.now()+60000});
 p.storage.set('ai-account-claude-v1',JSON.stringify({mode:'direct',accessToken:'claude-token'}));
 p.storage.set('ai-selected-v1',JSON.stringify('claude'));p.events.ready();
 assert.equal(current(p).provider,'claude');assert.equal(p.requests[0].headers.Authorization,'Bearer claude-token');
 assert.equal(JSON.parse(p.storage.get('codex-device-login-v1')).profileId,profile(p,'codex').id);
});
test('slow watch delivery coalesces rapid switches to the latest selected account',()=>{
 const p=phone(directConfig,null,true);p.events.ready();const personal=current(p).id;
 p.action({action:'createAccount',provider:'claude',label:'Work'});const work=current(p).id;
 p.action({action:'saveProvider',provider:'claude',accountId:work,credentials:'work-token'});
 p.action({action:'selectAccount',accountId:personal});
 assert.equal(p.messages.length,1);
 p.acks.shift()();
 assert.equal(p.messages.length,2);assert.equal(p.messages.at(-1).ACCOUNT_ID,personal);
 assert.equal(p.messages.some(m=>m.ACCOUNT_ID===work),false);
 p.acks.shift()();
 p.reply(1,200,{five_hour:{utilization:99},seven_day:null});
 assert.equal(p.messages.length,2);
 p.reply(0,200,usage);
 assert.equal(p.messages.at(-1).P_LEFT,80);assert.equal(p.messages.at(-1).ACCOUNT_ID,personal);
});
test('reported plan names stay with their own account when switching profiles',()=>{
 const p=phone(directConfig);p.events.ready();const personal=current(p).id;
 p.reply(0,200,{...usage,plan_type:'plus'});
 assert.equal(p.messages.at(-1).PROVIDER_NAME,'Codex Plus');assert.equal(profile(p,'codex').config.plan,'Plus');
 p.action({action:'createAccount',provider:'claude',label:'Work'});const work=current(p).id;
 p.action({action:'saveProvider',provider:'claude',accountId:work,credentials:JSON.stringify({claudeAiOauth:{accessToken:'claude-token',subscriptionType:'max'}})});
 p.reply(1,200,{five_hour:{utilization:20},seven_day:null});
 assert.equal(p.messages.at(-1).PROVIDER_NAME,'Claude Max');
 p.action({action:'selectAccount',accountId:personal});assert.equal(p.messages.at(-1).PROVIDER_NAME,'Codex Plus');
});
test('saved order controls navigation across providers without changing credentials',()=>{
 const p=phone(directConfig);p.events.ready();const codex=current(p).id;
 p.action({action:'saveProvider',provider:'claude',credentials:'claude-token'});const claude=current(p).id;
 p.action({action:'saveProvider',provider:'custom',url:'https://example.com/usage',credentials:'custom-token',name:'Other'});const custom=current(p).id;
 p.action({action:'reorderAccounts',accountIds:[claude,custom,codex]});
 assert.deepEqual(profiles(p).map(a=>a.id),[claude,custom,codex]);assert.equal(profile(p,'codex').config.accessToken,authToken);assert.equal(current(p).id,custom);
 p.events.appmessage({payload:{NAV:1}});assert.equal(current(p).id,codex);
 const order=profiles(p).map(a=>a.id);p.action({action:'reorderAccounts',accountIds:[codex,codex,custom]});assert.deepEqual(profiles(p).map(a=>a.id),order);
});
test('one settings save commits edits together and preserves renewed credentials',()=>{
 const p=phone(directConfig);p.events.ready();const codex=current(p).id;
 p.reply(0,401,{});const renewed=makeJwt({exp:2000000000});
 p.reply(1,200,{access_token:renewed,refresh_token:'renewed-refresh'});
 p.action({action:'saveSettings',state:{selectedId:codex,accounts:[{id:'draft-work',provider:'claude',label:'Work'},{id:codex,provider:'codex',label:'Home'}]}});
 assert.equal(profiles(p).length,2);assert.equal(current(p).label,'Home');
 assert.equal(current(p).config.accessToken,renewed);assert.equal(current(p).config.refreshToken,'renewed-refresh');
 assert.equal(profile(p,'claude').label,'Work');assert.ok(!profile(p,'claude').id.startsWith('draft-'));
 const before=p.storage.get('ai-profiles-v2');
 p.action({action:'saveSettings',state:{selectedId:codex,accounts:[{id:codex,provider:'gemini',label:'Invalid'}]}});
 assert.equal(p.storage.get('ai-profiles-v2'),before);
 p.action({action:'saveSettings',state:{selectedId:codex,accounts:[{id:codex,provider:'codex',label:'Home'}]}});
 assert.equal(profiles(p).length,1);assert.equal(current(p).config.accessToken,renewed);
});
