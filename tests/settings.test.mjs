import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const pages=createRequire(import.meta.url)('../src/pkjs/config');
test('settings page closes its inline style before the visible body begins',()=>{
 const html=pages.settings({selectedId:'a',accounts:[{id:'a',provider:'codex',label:'Work',configured:true}]});
 assert.ok(html.includes('</style></head><body><main>'),'The configuration WebView must not parse its page body as CSS');
 assert.match(html,/<span class="mark codex-brand" aria-hidden="true"><svg[^>]+viewBox="0 0 24 24"/,'The phone settings header should use the Codex app mark');
 assert.ok(!html.includes('&gt;_'),'The generic terminal placeholder should not appear as the app icon');
 assert.ok(html.endsWith('</body></html>'));
 const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];assert.equal(scripts.length,1);new vm.Script(scripts[0][1]);
});
test('selecting an account does not navigate out of the settings page',()=>{
 const html=pages.settings({selectedId:'a',accounts:[{id:'a',provider:'codex',label:'Work',configured:true}]});
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const element={addEventListener(){},children:[],setAttribute(){},querySelector(){return element;},querySelectorAll(){return [];},classList:{add(){},remove(){}}};
 const location={href:'settings'};
 const document={getElementById(){return element;},querySelectorAll(){return [];},querySelector(){return element;},addEventListener(){}};
 const context={location,document,window:{},encodeURIComponent,console};vm.createContext(context);vm.runInContext(script,context);
 context.closePage({action:'selectAccount',accountId:'a'});
 assert.equal(location.href,'settings','Selecting an account closed the Pebble configuration window');
});
test('rename and remove account menu actions update the inline settings list',()=>{
 function openSettings(){
  let clicked=null;
  const elements={};
  function makeElement(){return {hidden:false,value:'',textContent:'',className:'',children:[],open:false,addEventListener(){},setAttribute(){},getAttribute(){return '';},querySelector(){return this;},querySelectorAll(){return [];},contains(){return false;},focus(){},scrollIntoView(){},classList:{add(){},remove(){},contains(){return false;}}};}
  const list=makeElement();Object.defineProperty(list,'innerHTML',{get(){return this.html||'';},set(value){this.html=value;this.children=[...value.matchAll(/data-account-id="([^"]+)"/g)].map(m=>({getAttribute(){return m[1];}}));if(clicked)clicked.parentNode=null;}});
  const save=makeElement();
  const document={getElementById(id){return elements[id]||(elements[id]=id==='watch-order'?list:id==='save-settings'?save:makeElement());},querySelectorAll(){return [];},querySelector(){return makeElement();},addEventListener(){}};
  const location={href:'settings'},state={selectedId:'codex-work',accounts:[{id:'codex-work',provider:'codex',label:'Work',configured:true},{id:'claude-personal',provider:'claude',label:'Personal',configured:true}]};
  const html=pages.settings(state),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  elements['account-editor']=makeElement();elements['account-editor'].hidden=true;
  list.innerHTML=html.match(/<ul id="watch-order"[^>]*>([\s\S]*?)<\/ul>/)[1];
  const context={location,document,window:{},encodeURIComponent,console};vm.createContext(context);vm.runInContext(script,context);
  function click(label,id){
   const re=new RegExp('<button class="menu-action[^\"]*" onclick="([^\"]*)">'+label+'</button>');
   const match=list.innerHTML.match(re);assert.ok(match,'missing '+label+' button');
   const details={open:true},menu={parentNode:details};clicked={className:'menu-action',parentNode:menu};
   const code=match[1].replace(/&quot;/g,'"').replace(/&amp;/g,'&');
   context.activeButton=clicked;vm.runInContext('(function(){'+code+'}).call(activeButton)',context);delete context.activeButton;
   return details;
  }
  return {list,click,location,document};
 }
 const rename=openSettings(),menu=rename.click('Rename','codex-work');
 assert.equal(menu.open,false);assert.equal(rename.document.getElementById('account-editor').hidden,false);assert.equal(rename.document.getElementById('edit-name').value,'Work');
 rename.document.getElementById('edit-name').value='Renamed';rename.document.getElementById('edit-form').onsubmit({preventDefault(){}});
 assert.ok(rename.list.innerHTML.includes('Renamed'));
 const remove=openSettings();remove.click('Remove','codex-work');
 assert.ok(!remove.list.innerHTML.includes('data-account-id="codex-work"'));assert.ok(remove.list.innerHTML.includes('data-account-id="claude-personal"'));
 assert.equal(remove.location.href,'settings');
});
