/* No credentials are embedded in the configuration URL or page. */
var SETTINGS_CSS =
  '*{box-sizing:border-box}html{color-scheme:light}body{margin:0;background:#faf9f6;color:#202020;font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}main{max-width:440px;margin:0 auto;padding:40px 24px 28px}.brand{display:flex;align-items:center;gap:10px;margin-bottom:44px}.mark{display:block;width:32px;height:32px;border-radius:8px;overflow:hidden}.mark svg{display:block;width:100%;height:100%}.wordmark{font-size:20px;font-weight:600;letter-spacing:-.6px}.eyebrow{font:11px ui-monospace,Menlo,monospace;letter-spacing:1.1px;text-transform:uppercase;color:#777;margin-bottom:10px}h1{font-size:32px;line-height:1.15;letter-spacing:-1.3px;font-weight:600;margin:0 0 12px}p{margin:0 0 24px;color:#737373}.panel{margin:28px 0 24px;padding:18px 0;border-top:1px solid #e5e3df;border-bottom:1px solid #e5e3df;display:flex;align-items:center;justify-content:space-between;gap:12px}.label{font-size:14px;font-weight:500}.badge{display:flex;align-items:center;gap:6px;font-size:12px;color:#666}.dot{width:6px;height:6px;border-radius:50%;background:#202020}.dot.empty{background:#b8b6b1}button,.button{display:flex;align-items:center;justify-content:center;width:100%;min-height:48px;padding:12px 18px;border:1px solid #202020;border-radius:24px;background:#202020;color:white;font:500 14px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-decoration:none;cursor:pointer;transition:background .15s}button:hover,.button:hover{background:#383838}button.secondary,.button.secondary{background:transparent;color:#202020;border-color:#d8d6d1;margin-top:10px}button.secondary:hover,.button.secondary:hover{background:#efede8}button.quiet{background:transparent;color:#737373;border:0;margin-top:14px;min-height:40px}button:focus-visible,a:focus-visible{outline:2px solid #202020;outline-offset:4px}.note{font-size:12px;line-height:1.6;margin:20px 0 0;color:#85837e}.footer{margin-top:48px;padding-top:16px;border-top:1px solid #e5e3df;font:11px ui-monospace,Menlo,monospace;color:#96938c}.code-box{background:#eeede9;border:1px solid #e4e2dc;border-radius:12px;padding:22px 12px;text-align:center;margin:24px 0;display:block;color:#202020;cursor:pointer}.code-box:hover{background:#e7e5df}.copy-control{display:inline-flex;align-items:center;justify-content:center;background:#faf9f6;border:1px solid #d8d6d1;border-radius:18px;padding:6px 14px;margin-top:12px;font-size:12px;letter-spacing:0;color:#202020}.code-label{font:10px ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:1px;color:#85837e}code{display:block;font:500 30px/1.6 ui-monospace,Menlo,monospace;letter-spacing:2px;color:#202020;overflow-wrap:anywhere;-webkit-user-select:all;user-select:all}.order-list{list-style:none;padding:0;margin:16px 0}.order-item{position:relative;display:flex;transition:transform 180ms cubic-bezier(.2,.7,.2,1),opacity 120ms ease,box-shadow 120ms ease;align-items:center;gap:10px;background:#fff;border:1px solid #e5e3df;border-radius:12px;padding:8px 12px;margin-bottom:8px}.order-item.dragging{opacity:.78;background:#eeede9;box-shadow:0 8px 20px #20202018;transform:scale(1.015);z-index:2}.drag-handle{width:32px;min-height:36px;padding:4px;border:0;border-radius:6px;background:transparent;color:#85837e;cursor:grab;touch-action:none;font-size:20px}.drag-handle:hover{background:#eeede9}.order-label{font-size:13px;flex:1}.provider-symbol{display:inline-flex;width:18px;height:18px;vertical-align:middle;margin-right:8px}.provider-symbol svg{width:100%;height:100%;display:block}.provider-symbol{color:#202020}.provider-symbol svg path[fill="url(#gemini)"]{fill:url(#gemini)}.codex-symbol{color:#202020}.codex-symbol svg{border-radius:6px}.custom-symbol{color:#8b5cf6}.order-message{font-size:12px;color:#737373;margin-top:12px}[hidden]{display:none!important}.account-select{display:block;flex:1;min-width:0;min-height:44px;padding:0;border:0;border-radius:0;background:transparent;color:#202020;text-align:left}.account-select:hover{background:transparent}.account-title{display:block;font-size:13px;font-weight:500;overflow-wrap:anywhere}.account-status{display:block;font-size:11px;color:#85837e;margin-top:2px}.account-menu{flex:none;margin:0}.account-menu summary{list-style:none;display:grid;place-items:center;width:36px;height:40px;font-size:22px;border-radius:8px;color:#737373}.account-menu summary::-webkit-details-marker,.add-account summary::-webkit-details-marker{display:none}.account-menu summary:hover,.account-menu[open] summary{background:#eeede9}.account-menu summary:focus-visible{outline:2px solid #202020;outline-offset:2px}.menu-actions{position:absolute;right:8px;top:54px;z-index:5;min-width:190px;padding:6px;background:#fff;border:1px solid #e5e3df;border-radius:12px;box-shadow:0 8px 24px #20202014}.menu-action{justify-content:flex-start;min-height:40px;padding:10px 12px;border:0;border-radius:7px;background:transparent;color:#202020;text-align:left;font-size:13px}.menu-action:hover{background:#eeede9}.menu-action.destructive{color:#b42318}.add-account{margin:12px 0 0}.add-account form{padding:12px 16px 16px;border:1px solid #e5e3df;border-radius:12px;background:#fff;margin-top:10px}.add-account>summary{list-style:none}.add-account>summary::-webkit-details-marker{display:none}.add-account[open]>summary{background:#efede8}.provider-dropdown{position:relative}.provider-toggle{width:100%;min-height:46px;padding:10px 12px;border:1px solid #d8d6d1;border-radius:8px;background:#fff;color:#202020;display:flex;justify-content:space-between;text-align:left}.provider-options{position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:8;max-height:260px;overflow:auto;padding:5px;background:#fff;border:1px solid #d8d6d1;border-radius:10px;box-shadow:0 8px 24px #20202014}.provider-option{display:flex;justify-content:flex-start;gap:8px;min-height:40px;padding:8px 10px;border:0;border-radius:6px;background:transparent;color:#202020;text-align:left}.provider-option:hover,.provider-option[aria-selected="true"]{background:#efede8}.provider-option .provider-symbol{margin-right:0}.add-account form button{margin-top:16px}.add-account summary{list-style:none}.provider-picker{display:grid;grid-template-columns:1fr 1fr;gap:2px;padding:8px;margin-top:10px;background:#fff;border:1px solid #e5e3df;border-radius:12px}.editor{padding:16px;margin-top:16px;border:1px solid #d8d6d1;border-radius:12px}.editor h2{font-size:16px;margin:0}.order-message:empty{display:none}label{display:block;font-size:13px;margin:18px 0 6px}input,textarea{width:100%;padding:12px;background:#fff;border:1px solid #d8d6d1;border-radius:8px;font:14px ui-monospace,Menlo,monospace;color:#202020}details{margin:18px 0}summary{color:#737373;font-size:13px;cursor:pointer}form button{margin-top:20px}#error,#add-error{color:#b42318;font-size:13px;line-height:1.45}.steps{margin:24px 0;padding-left:20px;color:#737373;font-size:14px}.steps li{padding-left:4px;margin-bottom:12px}.steps strong{color:#202020;font-weight:500}@media(prefers-reduced-motion:reduce){.order-item{transition:none!important}}@media(max-width:340px){main{padding:28px 18px}.brand{margin-bottom:32px}h1{font-size:28px}code{font-size:25px}}';
function page(body, subtitle, script) {
  return (
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI Limits</title><style>' +
    SETTINGS_CSS +
    '</style></head><body><main>' +
    '<header class="brand"><span class="mark codex-brand" aria-hidden="true">' +
    CODEX_SVG +
    '</span><span class="wordmark">ai limits</span></header><div class="eyebrow">' +
    subtitle +
    '</div>' +
    body +
    '<footer class="footer">AI LIMITS / PEBBLE</footer></main><script>function closePage(data){location.href="pebblejs://close#"+encodeURIComponent(JSON.stringify(data));}' +
    (script || '') +
    '</script></body></html>'
  );
}
function escape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function button(label, data, className) {
  return (
    '<button type="button" class="' +
    escape(className || '') +
    '" onclick="if(this.className.indexOf(\'menu-action\')>=0){var m=this.parentNode&&this.parentNode.parentNode;if(m&&m.open!==undefined)m.open=false;}closePage(' +
    escape(JSON.stringify(data)) +
    ');">' +
    escape(label) +
    '</button>'
  );
}
var catalog = require('./providers').catalog;
var providerIcons = require('./provider-icons');
var CODEX_SVG = providerIcons.SVG.codex;
var providerIcon = providerIcons.providerIcon;
exports.settings = function (state) {
  var rows = state.accounts
    .map(function (a) {
      var p = catalog.filter(function (p) {
          return p.id === a.provider;
        })[0],
        selected = a.id === state.selectedId;
      var title = p.name + ' · ' + escape(a.label);
      var connection =
        a.provider === 'codex'
          ? a.configured
            ? 'Reconnect ChatGPT'
            : 'Sign in with ChatGPT'
          : a.configured
            ? 'Update credentials'
            : 'Connect ' + p.name;
      return (
        '<li class="order-item" data-account-id="' +
        escape(a.id) +
        '"><button type="button" class="drag-handle" draggable="false" aria-label="Move ' +
        p.name +
        ' ' +
        escape(a.label) +
        '">⠿</button>' +
        button(
          '<span class="account-title">' +
            providerIcon(a.provider) +
            title +
            '</span><span class="account-status">' +
            (a.configured ? 'Connected' : 'Not connected') +
            (selected ? ' · Selected' : '') +
            '</span>',
          { action: 'selectAccount', accountId: a.id },
          'account-select'
        ) +
        '<details class="account-menu"><summary aria-label="Actions for ' +
        title +
        '">⋯</summary><div class="menu-actions">' +
        button(connection, { action: 'login', accountId: a.id }, 'menu-action') +
        button('Rename', { action: 'renameAccount', accountId: a.id }, 'menu-action') +
        button('Remove', { action: 'deleteAccount', accountId: a.id }, 'menu-action destructive') +
        '</div></details></li>'
      );
    })
    .join('');
  var add =
    '<details class="add-account"><summary class="button secondary">+ Add account</summary><form id="add-account-form"><label>Connection type</label><div id="provider-dropdown" class="provider-dropdown"><button id="provider-toggle" class="provider-toggle" type="button" aria-haspopup="listbox" aria-expanded="false"><span id="provider-choice">Choose a provider</span><span aria-hidden="true">⌄</span></button><div id="provider-options" class="provider-options" role="listbox" hidden>' +
    catalog
      .map(function (p) {
        return (
          '<button type="button" class="provider-option" role="option" data-provider="' +
          p.id +
          '">' +
          providerIcon(p.id) +
          escape(p.name) +
          '</button>'
        );
      })
      .join('') +
    '</div></div><input id="provider-type" type="hidden"><label for="add-name">Account name</label><input id="add-name" maxlength="16" autocomplete="off" placeholder="Personal or Work"><p id="add-error" role="alert"></p><button type="submit">Add account</button></form></details>';
  var editor =
    '<section id="account-editor" class="editor" hidden><h2 id="edit-title">Account name</h2><form id="edit-form"><label for="edit-name">Account name</label><input id="edit-name" required maxlength="16" autocomplete="off" placeholder="Personal or Work"><p id="edit-error" role="alert"></p><button type="submit">Apply name</button><button id="cancel-edit" class="quiet" type="button">Cancel</button></form></section>';
  var connectionEditor =
    '<section id="connection-editor" class="editor" hidden><h2 id="connection-title">Connect account</h2><p id="connection-hint" class="note"></p><form id="connection-form"><div id="connection-fields"></div><p id="connection-error" role="alert"></p><button id="connection-save" type="submit">Save connection</button><button id="cancel-connection" class="quiet" type="button">Cancel</button></form></section>';
  var icons = {};
  catalog.forEach(function (p) {
    icons[p.id] = providerIcon(p.id);
  });
  return page(
    '<h1>Accounts.</h1><p>Drag to reorder. Save when you’re done.</p><ul id="watch-order" class="order-list">' +
      rows +
      '</ul><p id="empty-accounts" class="note" hidden>Add an account to get started.</p><button id="save-order" class="secondary" type="button" hidden disabled>Save order</button><div id="order-message" class="order-message" role="status" aria-live="polite"></div>' +
      add +
      editor +
      connectionEditor +
      '<p id="settings-message" class="note" role="status" aria-live="polite">Changes apply when you save.</p><button id="save-settings" type="button" style="margin-top:16px">Save and close</button>',
    'Settings',
    orderScript + require('./settings-ui').script(state, catalog, icons)
  );
};
exports.accountName = function (providerId, account) {
  var provider = catalog.filter(function (p) {
    return p.id === providerId;
  })[0];
  return page(
    '<h1>' +
      (account ? 'Rename account.' : 'Add ' + provider.name + '.') +
      '</h1><p>Give this account a short name to identify it on your watch.</p><form id="name-form"><label for="label">Account name</label><input id="label" required maxlength="16" autocomplete="off" placeholder="Personal or Work" value="' +
      escape(account ? account.label : '') +
      '"><p id="error" role="alert"></p><button>' +
      (account ? 'Save name' : 'Add and connect') +
      '</button></form>' +
      button('Back', { action: 'back' }, 'quiet'),
    'Account profile',
    'document.getElementById("name-form").onsubmit=function(e){e.preventDefault();var label=document.getElementById("label").value.trim();if(!label){document.getElementById("error").textContent="Enter an account name.";return;}closePage(' +
      JSON.stringify(
        account
          ? { action: 'saveName', accountId: account.id }
          : { action: 'createAccount', provider: providerId }
      ).replace(/}/, '') +
      ',label:label});};'
  );
};
exports.credentials = function (id, account) {
  account = account || { id: '', label: 'Personal' };
  var selected = catalog.filter(function (p) {
    return p.id === id;
  })[0];
  var hints = {
    claude:
      'Paste a Claude Code OAuth credentials JSON or access token. Subscription limits use the internal Claude usage endpoint. A refresh token enables renewal.',
    gemini:
      'Paste Gemini CLI OAuth credentials JSON. The Code Assist project can be discovered automatically; optionally enter it to override. Choose two exact model IDs, or leave them blank to use the first two returned models.',
    'claude-api':
      'Enter an Anthropic key with access to the organization Rate Limits API and an exact model ID. Shows configured requests/min and input tokens/min caps, not remaining quota.',
    'gemini-api':
      'Use Google Cloud OAuth credentials with quota-read access, your project number, model dimension, and exact quota metric from Cloud Console. Shows configured caps; an AI Studio API key alone cannot read them.',
    custom:
      'Connect a trusted HTTPS endpoint returning the documented two-window JSON format. An optional bearer token is sent only to the address you enter.'
  };
  function input(name, label, required) {
    return (
      '<label for="' +
      name +
      '">' +
      label +
      '</label><input id="' +
      name +
      '" name="' +
      name +
      '" ' +
      (required ? 'required ' : '') +
      'autocomplete="off">'
    );
  }
  var fields =
    '<label for="credentials">' +
    (id === 'claude-api'
      ? 'API key'
      : id === 'custom'
        ? 'Bearer token (optional)'
        : 'OAuth credentials JSON or access token') +
    '</label><textarea id="credentials" rows="5" autocomplete="off" autocapitalize="off" spellcheck="false" ' +
    (id === 'custom' ? '' : 'required') +
    '></textarea>';
  if (id === 'claude' || id === 'gemini' || id === 'gemini-api') {
    fields +=
      '<label for="credential-file">Import credentials file (optional)</label><input id="credential-file" type="file" accept=".json,application/json">';
  }
  if (id === 'claude-api' || id === 'gemini' || id === 'gemini-api') {
    fields += input('model', 'Model ID', id !== 'gemini');
  }
  if (id === 'gemini') {
    fields +=
      input('secondaryModel', 'Second model ID', false) +
      input('project', 'Code Assist project ID (optional)', false);
  }
  if (id === 'gemini-api') {
    fields +=
      input('project', 'Google Cloud project number', true) +
      input('quotaMetric', 'Quota metric name', true);
  }
  if (id === 'custom') {
    fields += input('url', 'HTTPS endpoint', true) + input('name', 'Watch display name', false);
  }
  if (id === 'claude' || id === 'gemini' || id === 'gemini-api') {
    fields +=
      '<details><summary>OAuth client (optional)</summary>' +
      input('clientId', 'Client ID', false) +
      input('clientSecret', 'Client secret', false) +
      '</details>';
  }
  return page(
    '<h1>Connect ' +
      selected.name +
      '.</h1><p class="account-caption">' +
      escape(account.label) +
      '</p><p>' +
      hints[id] +
      '</p><form id="connection">' +
      fields +
      '<p id="error" role="alert"></p><button type="submit">Save connection</button></form><button class="quiet" onclick="closePage({action:\'back\'})">Back</button><p class="note">Credentials stay in the Pebble companion on your phone. The app only reads usage metadata and never generates model responses.</p>',
    'Account connection',
    'var picker=document.getElementById("credential-file");if(picker){picker.onchange=function(){var file=picker.files[0];if(!file)return;if(file.size>65536){document.getElementById("error").textContent="Choose a small credentials JSON file.";return;}var reader=new FileReader();reader.onload=function(){document.getElementById("credentials").value=reader.result;};reader.onerror=function(){document.getElementById("error").textContent="Could not read the file.";};reader.readAsText(file);};}document.getElementById("connection").onsubmit=function(e){e.preventDefault();var data={action:"saveProvider",provider:' +
      JSON.stringify(id) +
      ',accountId:' +
      JSON.stringify(account.id) +
      '};["credentials","project","model","secondaryModel","quotaMetric","clientId","clientSecret","url","name"].forEach(function(key){var field=document.getElementById(key);if(field)data[key]=field.value.trim();});closePage(data);};'
  );
};
exports.device = function (pending) {
  return page(
    '<h1>Connect your account.</h1><p class="account-caption">' +
      escape(pending.label || 'Personal') +
      '</p><p>Use this code to finish signing in with ChatGPT.</p><button type="button" class="code-box" onclick="copyCode()" aria-label="Copy one-time code"><span class="code-label">Your one-time code</span><code id="device-code">' +
      escape(pending.userCode) +
      '</code><span id="copy-status" class="copy-control" role="status" aria-live="polite">Copy code</span></button>' +
      '<a class="button secondary" href="https://auth.openai.com/codex/device" target="_blank" rel="noopener noreferrer">Open ChatGPT sign-in ↗</a>' +
      '<ol class="steps"><li><strong>Enter the code</strong> on the OpenAI page.</li><li><strong>Approve the sign-in</strong>, then return to Pebble.</li></ol>' +
      '<button onclick="closePage({action:\'finishLogin\'})">I have approved the sign-in</button><button class="quiet" onclick="closePage({action:\'cancelLogin\'})">Cancel</button><p class="note">Check that you are signed into the intended ChatGPT account before approval. The code expires after 15 minutes. If the link does not open, visit auth.openai.com/codex/device in Safari.</p>',
    'Account connection',
    copyScript
  );
};

// Clipboard API may be unavailable on local data: pages in the iOS companion.
var copyScript =
  'var copyTimer;function copyCode(){var value=document.getElementById("device-code").textContent;var status=document.getElementById("copy-status");function result(ok){clearTimeout(copyTimer);status.textContent=ok?"Copied":"Select code to copy";copyTimer=setTimeout(function(){status.textContent="Copy code";},2500);}function fallback(){var input=document.createElement("textarea");input.value=value;input.readOnly=true;input.style.cssText="position:fixed;left:0;top:0;opacity:0;font-size:16px;pointer-events:none";document.body.appendChild(input);var focused=document.activeElement;var ok=false;try{input.focus();input.select();input.setSelectionRange(0,value.length);ok=document.execCommand("copy");}catch(e){}document.body.removeChild(input);if(focused&&focused.focus){focused.focus();}if(!ok){var range=document.createRange();range.selectNodeContents(document.getElementById("device-code"));var selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);}result(ok);}if(navigator.clipboard&&navigator.clipboard.writeText){try{navigator.clipboard.writeText(value).then(function(){result(true);},fallback);}catch(e){fallback();}}else{fallback();}}';

var orderScript =
  'var list=document.getElementById("watch-order"),save=document.getElementById("save-order"),moving=null,startY=0,pointerMoved=false;function changed(){save.disabled=false;document.getElementById("settings-message").textContent="Changes ready to save.";}function place(y){var rows=Array.prototype.slice.call(list.children).filter(function(row){return row!==moving;}),first=rows.map(function(row){return row.getBoundingClientRect().top;}),before=rows.filter(function(row){var r=row.getBoundingClientRect();return y<r.top+r.height/2;})[0];if((before&&before===moving.nextElementSibling)||(!before&&moving===list.lastElementChild))return;list.insertBefore(moving,before||null);rows.forEach(function(row,i){var delta=first[i]-row.getBoundingClientRect().top;if(Math.abs(delta)>1){row.style.transition="none";row.style.transform="translateY("+delta+"px)";requestAnimationFrame(function(){row.style.transition="transform 180ms cubic-bezier(.2,.7,.2,1)";row.style.transform="";});}});changed();}list.addEventListener("dragstart",function(e){var handle=e.target.closest(".drag-handle");if(!handle)return;moving=handle.closest(".order-item");moving.classList.add("dragging");e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",moving.getAttribute("data-account-id"));});list.addEventListener("dragover",function(e){if(moving){e.preventDefault();place(e.clientY);}});list.addEventListener("drop",function(e){e.preventDefault();if(moving)moving.classList.remove("dragging");moving=null;});list.addEventListener("dragend",function(){if(moving)moving.classList.remove("dragging");moving=null;});list.addEventListener("pointerdown",function(e){var handle=e.target.closest(".drag-handle");if(!handle)return;e.preventDefault();handle.focus();moving=handle.closest(".order-item");startY=e.clientY;pointerMoved=false;if(handle.setPointerCapture)handle.setPointerCapture(e.pointerId);moving.classList.add("dragging");});list.addEventListener("pointermove",function(e){if(moving){if(Math.abs(e.clientY-startY)>4)pointerMoved=true;if(pointerMoved){e.preventDefault();place(e.clientY);if(e.clientY<60)window.scrollBy(0,-12);else if(e.clientY>window.innerHeight-60)window.scrollBy(0,12);}}});function endPointer(){if(moving)moving.classList.remove("dragging");moving=null;}list.addEventListener("pointerup",endPointer);list.addEventListener("pointercancel",endPointer);list.addEventListener("keydown",function(e){if(!e.target.closest(".drag-handle")||(e.key!=="ArrowUp"&&e.key!=="ArrowDown"))return;e.preventDefault();var row=e.target.closest(".order-item");if(e.key==="ArrowUp"&&row.previousElementSibling){list.insertBefore(row,row.previousElementSibling);changed();}else if(e.key==="ArrowDown"&&row.nextElementSibling){list.insertBefore(row.nextElementSibling,row);changed();}e.target.focus();});save.onclick=function(){closePage({action:"reorderAccounts",accountIds:Array.prototype.map.call(list.children,function(row){return row.getAttribute("data-account-id");})});};';
