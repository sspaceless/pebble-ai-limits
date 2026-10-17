/* Each request and login is bound to a local profile, independent of watch selection. */
var direct=require('./direct');
var pages=require('./config');
var providers=require('./providers');
var accounts=require('./accounts');
var plans=require('./plans');
var PENDING='codex-device-login-v1';
var jobs={};
var outboxBusy=false,outboxLatest=null;
var loginBusy=false,loginGeneration=0,loginTimer=null;
function read(key){try{return JSON.parse(localStorage.getItem(key));}catch(_){return null;}}
function pendingLogin(){
  var pending=read(PENDING);
  if(pending&&!pending.profileId){var target=accounts.ensure('codex');pending.profileId=target.id;pending.revision=target.revision;localStorage.setItem(PENDING,JSON.stringify(pending));}
  return pending;
}
function describe(message){
  var current=accounts.current(),provider=providers.info(current.provider);
  message.PROVIDER=providers.catalog.indexOf(provider);
  var providerName=current.provider==='custom'&&current.config?current.config.name:provider.name;
  var plan=plans.label((current.snapshot||{}).plan||(current.config||{}).plan);
  message.PROVIDER_NAME=plans.header(providerName,plan);
  message.ACCOUNT_COUNT=accounts.ordered(accounts.load()).length;
  message.ACCOUNT_ID=current.id;message.ACCOUNT_NAME=current.label;message.ACCOUNT_REV=current.revision;
  return message;
}
function send(message){outboxLatest=describe(message);flushOutbox();}
function flushOutbox(){
  if(outboxBusy)return;
  var current=accounts.current(),message=outboxLatest;outboxLatest=null;
  if(!message)return;
  if(message.ACCOUNT_ID!==current.id||message.ACCOUNT_REV!==current.revision){if(outboxLatest)flushOutbox();return;}
  message.ACCOUNT_NAME=current.label;outboxBusy=true;
  Pebble.sendAppMessage(message,function(){
    outboxBusy=false;flushOutbox();
  },function(){
    outboxBusy=false;
    if(outboxLatest)flushOutbox();
  });
}
function status(value){var updating=value==='Updating...';send({STATUS:updating?'':value,UPDATING:updating?1:0});}
function statusFor(id,value){if(accounts.current().id===id)status(value);}
function openPage(html){Pebble.openURL('data:text/html;charset=utf-8,'+encodeURIComponent(html));}
function deliver(data,updating){
  var p=data.primary,s=data.secondary;
  if(!p||!s||typeof data.updatedAt!=='number')throw new Error('Invalid limits');
  send({P_LEFT:p.left,P_RESET:p.resetsAt,S_LEFT:s.left,S_RESET:s.resetsAt,
    P_VALUE:p.value||'',S_VALUE:s.value||'',P_NOTE:p.note||'',S_NOTE:s.note||'',UPDATED:data.updatedAt,STATUS:data.status||'',UPDATING:updating?1:0});
}
function errorStatus(error,provider,auth){
  if(error.reason==='SUBSCRIPTION_REQUIRED')return 'Subscription required';
  if(error.invalidData)return 'Invalid API data';
  if(error.status===401||(auth&&error.status===400))return providers.info(provider).kind==='api'?'Check API credentials':'Sign in again';
  if(error.status===403)return 'API access denied';if(error.status===429)return 'Try again later';return 'API unavailable';
}
function choose(id,updating){
  var current=accounts.select(id);
  // Do not cancel token renewal: its rotated credentials still belong to its original profile.
  if(current.snapshot)deliver(current.snapshot,updating!==false);else status(current.config?'Updating...':'Open app settings');
}
function navigate(direction){
  var rows=accounts.ordered(accounts.load());
  var index=-1;rows.forEach(function(a,i){if(a.id===accounts.current().id)index=i;});
  if(index<0)index=direction<0?0:-1;
  choose(rows[(index+(direction<0?-1:1)+rows.length)%rows.length].id);refresh();
}
function refresh(){
  var account=accounts.current(),pending=pendingLogin();
  if(pending&&pending.profileId===account.id){completeLogin();return;}
  if(!account.config){status('Open app settings');return;}
  if(account.snapshot)deliver(account.snapshot,true);else status('Updating...');
  if(jobs[account.id]&&jobs[account.id].revision===account.revision)return;
  var job={id:account.id,provider:account.provider,config:account.config,revision:account.revision,renewed:false};jobs[job.id]=job;
  function valid(){var latest=accounts.get(job.id);return latest&&latest.revision===job.revision;}
  function finish(){if(jobs[job.id]===job)delete jobs[job.id];}
  function fail(error,auth){finish();if(valid())statusFor(job.id,errorStatus(error,job.provider,auth));}
  function renew(){
    job.renewed=true;
    providers.renew(job.provider,job.config,function(error,next){
      if(error){fail(error,true);return;}
      // Compare revisions so a removed/reconnected account cannot be resurrected by a late refresh.
      var saved=accounts.save(job.id,next,job.revision);
      if(!saved){finish();return;}
      job.config=next;job.revision=saved.revision;
      usage();
    });
  }
  function usage(){
    providers.usage(job.provider,job.config,function(error,data){
      if(!valid()){finish();return;}
      if(error&&error.status===401&&!job.renewed){renew();return;}
      if(error){fail(error,false);return;}
      if(data.plan)job.config.plan=data.plan;
      // Project discovery and plan metadata do not change the local profile identity.
      var saved=accounts.save(job.id,job.config,job.revision);
      if(!saved){finish();return;}
      job.revision=saved.revision;accounts.cache(job.id,data,job.revision);finish();
      if(accounts.current().id===job.id)deliver(data);
    });
  }
  if(job.config.expiresAt&&job.config.expiresAt<=Date.now()/1000+60)renew();else usage();
}
function cancelPending(){
  loginGeneration++;direct.cancel('login');loginBusy=false;
  if(loginTimer)clearTimeout(loginTimer);loginTimer=null;localStorage.removeItem(PENDING);
}
function beginLogin(){
  var target=accounts.current();
  if(target.provider!=='codex'){openPage(pages.credentials(target.provider,{id:target.id,label:target.label}));return;}
  cancelPending();var generation=loginGeneration;loginBusy=true;statusFor(target.id,'Starting login...');
  direct.beginLogin(function(error,pending){
    if(generation!==loginGeneration)return;loginBusy=false;
    var latest=accounts.get(target.id);if(!latest||latest.revision!==target.revision)return;
    if(error){statusFor(target.id,errorStatus(error,'codex',true));return;}
    pending.profileId=target.id;pending.revision=target.revision;
    localStorage.setItem(PENDING,JSON.stringify(pending));statusFor(target.id,'Approve login on phone');
    pending.label=latest.label;openPage(pages.device(pending));
  });
}
function completeLogin(){
  if(loginBusy||loginTimer)return;
  var pending=pendingLogin();if(!pending)return;
  var target=accounts.get(pending.profileId);
  if(!target||target.revision!==pending.revision){cancelPending();return;}
  if(pending.expiresAt<=Date.now()){cancelPending();statusFor(target.id,'Login code expired');return;}
  loginBusy=true;var generation=loginGeneration;
  direct.pollLogin(pending,function(error,config){
    if(generation!==loginGeneration)return;loginBusy=false;
    var latest=accounts.get(target.id);if(!latest||latest.revision!==pending.revision){cancelPending();return;}
    if(error){
      if(error.pending){statusFor(target.id,'Waiting for approval');loginTimer=setTimeout(function(){loginTimer=null;completeLogin();},pending.interval*1000);}
      else {if(error.invalidData||(error.status>=400&&error.status<500&&error.status!==429))cancelPending();statusFor(target.id,errorStatus(error,'codex',true));}
      return;
    }
    accounts.save(target.id,config,pending.revision,true);cancelPending();
    if(accounts.current().id===target.id)refresh();
  });
}
function showSettings(){openPage(pages.settings(accounts.view()));}
Pebble.addEventListener('ready',refresh);
Pebble.addEventListener('appmessage',function(event){if(event&&event.payload&&event.payload.NAV)navigate(event.payload.NAV);else refresh();});
Pebble.addEventListener('showConfiguration',function(){
  var pending=pendingLogin(),current=accounts.current();
  if(pending&&pending.profileId===current.id&&pending.expiresAt>Date.now()){pending.label=current.label;openPage(pages.device(pending));}
  else {if(pending&&pending.expiresAt<=Date.now())cancelPending();showSettings();}
});
Pebble.addEventListener('webviewclosed',function(event){
  if(!event.response||event.response==='CANCELLED')return;
  try{
    var value=JSON.parse(decodeURIComponent(event.response)),target;
    if(value.action==='saveSettings'){
      var connectId=accounts.applySettings(value.state,value.connectAccountId),pending=pendingLogin();
      if(pending&&!accounts.get(pending.profileId))cancelPending();
      if(connectId){choose(connectId);beginLogin();}else{choose(accounts.current().id);refresh();}
      return;
    }
    if(value.action==='selectAccount'){choose(value.accountId);showSettings();refresh();return;}
    if(value.action==='selectProvider'){choose(accounts.ensure(value.provider).id);showSettings();refresh();return;}
    if(value.action==='addAccount'){openPage(pages.accountName(value.provider));return;}
    if(value.action==='createAccount'){target=accounts.add(value.provider,value.label);choose(target.id);beginLogin();return;}
    if(value.action==='renameAccount'){target=accounts.get(value.accountId||accounts.current().id);if(!target)throw new Error();openPage(pages.accountName(target.provider,{id:target.id,label:target.label}));return;}
    if(value.action==='saveName'){accounts.rename(value.accountId,value.label);choose(value.accountId,false);showSettings();return;}
    if(value.action==='saveProvider'){
      target=value.accountId?accounts.get(value.accountId):accounts.ensure(value.provider);
      if(!target||target.provider!==value.provider)throw new Error('Account mismatch');
      var config=providers.parseConfig(value.provider,value);accounts.save(target.id,config);
      choose(target.id);refresh();return;
    }
    if(value.action==='deleteAccount'||value.action==='logout'){
      var id=value.accountId||accounts.current().id,pending=pendingLogin();
      if(pending&&pending.profileId===id)cancelPending();
      accounts.remove(id);choose(accounts.current().id);showSettings();refresh();return;
    }
    if(value.action==='reorderAccounts'){accounts.reorder(value.accountIds);showSettings();return;}
    if(value.action==='back'){showSettings();return;}
    if(value.action==='login'){if(value.accountId)choose(value.accountId);beginLogin();return;}
    if(value.action==='finishLogin'){var pending=pendingLogin();if(pending)choose(pending.profileId);completeLogin();return;}
    if(value.action==='cancelLogin'){var pending=pendingLogin();cancelPending();if(pending)statusFor(pending.profileId,'Login cancelled');showSettings();return;}
    throw new Error('Unknown action');
  }catch(_){status('Invalid settings');}
});
