const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY="clearwater-life-phone-v2";
let state=JSON.parse(localStorage.getItem(KEY)||"{}");
state.phone=state.phone||{locked:true,open:false,currentView:"lock",currentApp:null,sessions:[],recents:[]};
state.settings=state.settings||{dark:false,showLabels:true};
state.notes=state.notes||{activeId:null,search:"",items:[
{id:"n1",title:"克萊爾灣",content:"開學前要確認的事情：\n\n・課表\n・宿舍用品\n・學校網站帳號",updated:Date.now()-3600000},
{id:"n2",title:"買東西",content:"衛生紙\n飲料\n新的筆記本",updated:Date.now()-7200000}
]};
state.accountRegistry=state.accountRegistry||{accounts:[
{id:"acct-test",serviceId:"mail.test",username:"player",address:"player@testmail.local",displayName:"測試郵箱",metadata:{fictional:true}},
{id:"acct-campus",serviceId:"mail.campus",username:"student",address:"student@campus.local",displayName:"校園郵箱",metadata:{fictional:true}}
]};
state.mail=state.mail||{
activeAccount:"acct-test",folder:"inbox",activeMessage:null,mode:"list",
boxes:{
"acct-test":[
{id:"tm1",folder:"inbox",from:"測試郵箱團隊",to:"player@testmail.local",subject:"歡迎使用世界內郵箱",body:"這是《人生》世界內的虛構郵件。\n\n目前這個郵件應用程式只用來測試遊戲內郵件、通知與帳號系統，不會連接任何真實郵件服務。",time:"今天 08:15",read:false},
{id:"tm2",folder:"inbox",from:"系統測試員",to:"player@testmail.local",subject:"多工測試",body:"你可以讀到一半回主畫面，再從最近使用畫面回來。郵件的目前帳號、資料夾與郵件都會保留。",time:"昨天",read:true}
],
"acct-campus":[
{id:"cm1",folder:"inbox",from:"校園郵箱",to:"student@campus.local",subject:"校園郵箱測試訊息",body:"這個帳號只是校園郵箱測試帳號，不代表正式學校郵箱名稱或網域。",time:"今天 07:40",read:false}
]
}};
state.messages=state.messages||{
activeThread:null,
mode:"list",
threads:[
{id:"thread-a",name:"測試聯絡人 A",phone:"+1 555 010 2211",unread:1,messages:[
{id:"sms-a1",from:"them",body:"到宿舍了嗎？",time:"09:12"},
{id:"sms-a2",from:"me",body:"到了。",time:"09:13"},
{id:"sms-a3",from:"them",body:"好，那晚點見。",time:"09:14"}
]},
{id:"thread-b",name:"測試聯絡人 B",phone:"+1 555 010 4186",unread:0,messages:[
{id:"sms-b1",from:"them",body:"明天記得帶東西。",time:"昨天"},
{id:"sms-b2",from:"me",body:"好。",time:"昨天"}
]}
]};
state.notifications=state.notifications||{
items:[
{id:"notif-msg-a",appId:"messages",title:"測試聯絡人 A",body:"好，那晚點見。",time:"剛剛",deepLink:"message://thread-a",read:false,createdAt:Date.now()-120000},
{id:"notif-mail-1",appId:"mail",title:"世界內郵箱",body:"你有一封未讀郵件。",time:"今天",deepLink:"mail://acct-test/tm1",read:false,createdAt:Date.now()-240000},
{id:"notif-school-1",appId:"school",title:"校園通知",body:"新的校園通知會顯示在這裡。",time:"今天",deepLink:null,read:true,createdAt:Date.now()-600000}
]
};
state.browser=state.browser||{
activeTab:"tab-1",
tabs:[{id:"tab-1",url:"home.local",history:["home.local"],historyIndex:0}],
bookmarks:["home.local"],
pageHistory:["home.local"],
panelOpen:false
};
// 中文介面遷移
for(const a of state.accountRegistry.accounts||[]){
 if(a.id==="acct-test")a.displayName="測試郵箱";
 if(a.id==="acct-campus")a.displayName="校園郵箱";
}
for(const box of Object.values(state.mail.boxes||{})){
 for(const m of box){
  if(m.from==="Test Mail Team")m.from="測試郵箱團隊";
  if(m.from==="System Tester")m.from="系統測試員";
  if(m.from==="Campus Mail")m.from="校園郵箱";
  if(typeof m.body==="string"){
   m.body=m.body.replaceAll("Mail App","郵件應用程式").replaceAll("Home","主畫面").replaceAll("Recent Apps","最近使用畫面").replaceAll("Mail 的","郵件的").replaceAll("Campus Mail","校園郵箱");
  }
 }
}
for(const n of state.notes.items||[]){if(n.title==="Clearwater Bay")n.title="克萊爾灣";}
const apps=[
{id:"notes",name:"記事本",zh:"記事本",icon:"▤",cls:"notes",home:true,enabled:true},
{id:"mail",name:"郵件",zh:"郵件",icon:"✉",cls:"mail",home:true,enabled:true},
{id:"messages",name:"簡訊",zh:"簡訊",icon:"💬",cls:"messages",home:true,enabled:true},
{id:"browser",name:"瀏覽器",zh:"瀏覽器",icon:"◎",cls:"browser",home:true,enabled:true},
{id:"school",name:"學校",zh:"學校",icon:"◆",cls:"school",home:false,enabled:false},
{id:"rpg",name:"遊戲",zh:"遊戲",icon:"♜",cls:"rpg",home:false,enabled:false},
{id:"settings",name:"設定",zh:"設定",icon:"⚙",cls:"settings",home:true,enabled:true}
];
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const appById=id=>apps.find(a=>a.id===id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function refreshClock(){const d=new Date(),t=d.toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit",hour12:false});$("#statusTime").textContent=t;$("#lockTime").textContent=t;$("#homeClock").textContent=t;$("#lockDate").textContent=d.toLocaleDateString("zh-TW",{month:"long",day:"numeric",weekday:"long"});$("#homeDate").textContent=d.toLocaleDateString("zh-TW",{month:"long",day:"numeric",weekday:"long"})}setInterval(refreshClock,30000);refreshClock();
function touchSession(id){if(!state.phone.sessions.includes(id))state.phone.sessions.push(id);state.phone.recents=state.phone.recents.filter(x=>x!==id);state.phone.recents.unshift(id);save()}
function closeSession(id){state.phone.sessions=state.phone.sessions.filter(x=>x!==id);state.phone.recents=state.phone.recents.filter(x=>x!==id);if(state.phone.currentApp===id)state.phone.currentApp=null;save();renderRecents()}
function clearAllSessions(){state.phone.sessions=[];state.phone.recents=[];state.phone.currentApp=null;save();renderRecents()}
function mailUnread(){return Object.values(state.mail.boxes||{}).flat().filter(m=>m.folder==="inbox"&&!m.read).length}
function messagesUnread(){return (state.messages.threads||[]).reduce((n,t)=>n+(Number(t.unread)||0),0)}
function notificationUnread(){return (state.notifications.items||[]).filter(n=>!n.read).length}
function notificationIcon(n){
 const a=appById(n.appId);
 if(a)return {icon:a.icon,cls:a.cls,name:a.name};
 if(n.appId==="school")return {icon:"◆",cls:"school",name:"學校"};
 return {icon:"●",cls:"system",name:"系統"};
}
function pushNotification(data){
 const n={
  id:data.id||("notif-"+Date.now()+"-"+Math.random().toString(36).slice(2,7)),
  appId:data.appId||"system",
  title:data.title||"新通知",
  body:data.body||"",
  time:data.time||"剛剛",
  deepLink:data.deepLink||null,
  read:false,
  createdAt:data.createdAt||Date.now()
 };
 state.notifications.items.unshift(n);
 state.notifications.items=state.notifications.items.slice(0,80);
 save();renderNotifications();
 return n.id;
}
function markNotificationRead(id){
 const n=(state.notifications.items||[]).find(x=>x.id===id);
 if(n)n.read=true;
 save();renderNotifications();
}
function removeNotification(id){
 state.notifications.items=(state.notifications.items||[]).filter(n=>n.id!==id);
 save();renderNotifications();
}
function clearNotifications(){
 state.notifications.items=[];
 save();renderNotifications();
}
window.PhoneNotificationService={
 push:pushNotification,
 markRead:markNotificationRead,
 remove:removeNotification,
 clear:clearNotifications,
 list:()=>JSON.parse(JSON.stringify(state.notifications.items||[]))
};
function appButton(a){const count=a.id==="mail"?mailUnread():a.id==="messages"?messagesUnread():0;const badge=count?'<span class="app-badge">'+count+'</span>':"";return '<button class="app-icon-btn" data-app="'+a.id+'"><span class="app-icon '+a.cls+'">'+a.icon+'</span>'+badge+'<small>'+a.name+'</small></button>'}
function renderNotifications(){
 const items=(state.notifications.items||[]).slice().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
 const unread=notificationUnread();
 const badge=$("#notificationBadge");
 if(badge){badge.textContent=unread>9?"9+":String(unread);badge.classList.toggle("hidden",unread===0)}
 const lock=$("#lockNotices");
 if(lock){
  const visible=items.slice(0,3);
  lock.innerHTML=visible.length?visible.map(n=>{
   const meta=notificationIcon(n);
   return '<button class="lock-notice '+meta.cls+'" data-notification="'+esc(n.id)+'"><span class="app-mini">'+esc(meta.icon)+'</span><div><b>'+esc(n.title)+'</b><small>'+esc(n.body)+'</small></div><time>'+esc(n.time||"")+'</time></button>';
  }).join(""):'';
 }
 const list=$("#notificationList");
 if(list){
  list.innerHTML=items.length?items.map(n=>{
   const meta=notificationIcon(n);
   return '<button class="notification-row '+meta.cls+' '+(!n.read?"unread":"")+'" data-notification="'+esc(n.id)+'"><span class="notification-icon">'+esc(meta.icon)+'</span><span><b>'+esc(n.title)+'</b><small>'+esc(n.body)+'</small></span><time>'+esc(n.time||"")+'</time></button>';
  }).join(""):'<div class="notification-empty"><span>◌</span><b>目前沒有通知</b><small>新的簡訊、郵件與世界事件會顯示在這裡。</small></div>';
 }
 $("[data-notification]").forEach(b=>b.onclick=()=>openNotification(b.dataset.notification));
}
function openNotification(id){
 const n=(state.notifications.items||[]).find(x=>x.id===id);if(!n)return;
 n.read=true;save();renderNotifications();
 if(state.phone.locked)state.phone.locked=false;
 if(n.deepLink){openDeepLink(n.deepLink);return}
 showView("notifications");
}
function renderAppLists(){$("#homeApps").innerHTML=apps.filter(a=>a.home).map(appButton).join("");$("#drawerApps").innerHTML=apps.map(appButton).join("");bindAppButtons();applySettings()}
function bindAppButtons(){$$("[data-app]").forEach(b=>b.onclick=()=>{const a=appById(b.dataset.app);if(!a.enabled){b.animate([{transform:"translateX(0)"},{transform:"translateX(-4px)"},{transform:"translateX(4px)"},{transform:"translateX(0)"}],{duration:220});return}openApp(a.id)})}
function showView(v){$("#lockScreen").classList.toggle("hidden",v!=="lock");$("#homeScreen").classList.toggle("hidden",v!=="home");$("#drawerScreen").classList.toggle("hidden",v!=="drawer");$("#notificationScreen").classList.toggle("hidden",v!=="notifications");$("#recentsScreen").classList.toggle("hidden",v!=="recents");$("#appScreen").classList.toggle("hidden",v!=="app");state.phone.currentView=v;if(v==="recents")renderRecents();if(v==="notifications")renderNotifications();save()}
function openPhone(){state.phone.open=true;$("#phoneLayer").classList.remove("hidden");renderNotifications();if(state.phone.locked)showView("lock");else if(state.phone.currentApp&&state.phone.sessions.includes(state.phone.currentApp))openApp(state.phone.currentApp,false);else showView("home");save()}
function closePhone(){state.phone.open=false;$("#phoneLayer").classList.add("hidden");save()}
$("#phoneToggle").onclick=openPhone;$("#scrim").onclick=closePhone;$("#notificationHandle").onclick=()=>{if(!state.phone.locked)showView("notifications")};$("#clearNotifications").onclick=clearNotifications;$("#drawerHandle").onclick=()=>showView("drawer");$$("[data-home]").forEach(b=>b.onclick=()=>showView("home"));$("#navHome").onclick=()=>{state.phone.currentApp=null;showView("home")};$("#navBack").onclick=()=>{if(state.phone.currentView==="app"){state.phone.currentApp=null;showView("home")}else if(["drawer","recents","notifications"].includes(state.phone.currentView))showView("home");else if(state.phone.currentView==="home")closePhone()};$("#navRecents").onclick=()=>{state.phone.currentApp=null;showView("recents")};$("#clearAll").onclick=clearAllSessions;
$("#appSearch").oninput=()=>{const q=$("#appSearch").value.trim().toLowerCase();$("#drawerApps").innerHTML=apps.filter(a=>!q||a.name.toLowerCase().includes(q)||a.zh.includes(q)).map(appButton).join("");bindAppButtons()};
(()=>{const surface=$("#lockScreen"),content=$("#lockContent");let tracking=false,startY=0,dy=0,pointerId=null;surface.addEventListener("pointerdown",e=>{if(state.phone.currentView!=="lock")return;tracking=true;startY=e.clientY;dy=0;pointerId=e.pointerId;surface.setPointerCapture(pointerId);surface.classList.add("dragging")});surface.addEventListener("pointermove",e=>{if(!tracking||e.pointerId!==pointerId)return;dy=Math.min(0,e.clientY-startY);content.style.transform="translateY("+dy+"px)";content.style.opacity=String(Math.max(.25,1-Math.abs(dy)/260))});const finish=()=>{if(!tracking)return;tracking=false;surface.classList.remove("dragging");if(dy<-75){content.style.transform="translateY(-120%)";content.style.opacity="0";setTimeout(()=>{state.phone.locked=false;content.style.transition="none";content.style.transform="";content.style.opacity="";requestAnimationFrame(()=>content.style.transition="");showView("home")},160)}else{content.style.transform="";content.style.opacity=""}};surface.addEventListener("pointerup",finish);surface.addEventListener("pointercancel",finish)})();
function openApp(id,front=true){const a=appById(id);if(!a||!a.enabled)return;state.phone.currentApp=id;if(front)touchSession(id);showView("app");if(id==="notes")mountNotes();if(id==="mail")mountMail();if(id==="messages")mountMessages();if(id==="browser")mountBrowser();if(id==="settings")mountSettings();save()}
function renderRecents(){const ids=state.phone.recents.filter(id=>state.phone.sessions.includes(id));state.phone.recents=ids;$("#recentsEmpty").classList.toggle("hidden",ids.length>0);$("#recentsTrack").classList.toggle("hidden",ids.length===0);$("#recentsTrack").innerHTML=ids.map(id=>{const a=appById(id);return '<button class="recent-card" data-recent="'+id+'"><div class="recent-card-head"><span class="mini-icon app-icon '+a.cls+'">'+a.icon+'</span><b>'+a.name+'</b></div><div class="recent-preview">'+recentPreview(id)+'</div></button>'}).join("");bindRecentGestures()}
function recentPreview(id){if(id==="notes"){const n=state.notes.items.find(x=>x.id===state.notes.activeId);return '<b>'+esc(n?.title||"記事本")+'</b><p>'+esc((n?.content||"尚未選擇筆記。").slice(0,120)).replace(/\n/g,"<br>")+'</p>'}if(id==="mail"){const acct=mailAccount(),msgs=mailBox().filter(m=>m.folder==="inbox");const unread=msgs.filter(m=>!m.read).length;return '<b>'+esc(acct?.displayName||"郵件")+'</b><p>收件匣 '+msgs.length+' 封<br>未讀 '+unread+' 封</p>'}if(id==="messages"){const t=state.messages.threads.find(x=>x.id===state.messages.activeThread)||state.messages.threads[0];return '<b>簡訊</b><p>'+(t?esc(t.name)+'<br>'+esc(t.messages[t.messages.length-1]?.body||""):"尚無對話")+'</p>'}if(id==="browser"){const t=browserTab();return '<b>瀏覽器</b><p>'+esc(t?.url||"home.local")+'</p>'}if(id==="settings")return '<b>手機設定</b><p>深色模式：'+(state.settings.dark?"開":"關")+'<br>應用程式名稱：'+(state.settings.showLabels?"顯示":"隱藏")+'</p>';return ""}
function bindRecentGestures(){$$("[data-recent]").forEach(card=>{let tracking=false,startX=0,startY=0,dy=0,dx=0,pid=null,dragged=false;card.addEventListener("pointerdown",e=>{tracking=true;pid=e.pointerId;startX=e.clientX;startY=e.clientY;dy=dx=0;dragged=false;card.setPointerCapture(pid)});card.addEventListener("pointermove",e=>{if(!tracking||e.pointerId!==pid)return;dx=e.clientX-startX;dy=e.clientY-startY;if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){dragged=true;const moveY=Math.min(0,dy);card.classList.add("dragging");card.style.transform="translateY("+moveY+"px) rotate("+(moveY/80)+"deg)";card.style.opacity=String(Math.max(.2,1-Math.abs(moveY)/220));e.preventDefault()}});const finish=()=>{if(!tracking)return;tracking=false;card.classList.remove("dragging");if(dragged&&dy<-85){const id=card.dataset.recent;card.style.transform="translateY(-130%)";card.style.opacity="0";setTimeout(()=>closeSession(id),160)}else{card.style.transform="";card.style.opacity="";if(!dragged)openApp(card.dataset.recent,true)}};card.addEventListener("pointerup",finish);card.addEventListener("pointercancel",finish)})}
function mountNotes(){$("#appMount").innerHTML="";$("#appMount").appendChild($("#notesTemplate").content.cloneNode(true));$("[data-app-back]").onclick=()=>{state.phone.currentApp=null;showView("home")};$("#newNote").onclick=()=>{const id="n"+Date.now();state.notes.items.unshift({id,title:"新筆記",content:"",updated:Date.now()});state.notes.activeId=id;save();renderNotes()};$("#noteSearch").value=state.notes.search||"";$("#noteSearch").oninput=()=>{state.notes.search=$("#noteSearch").value;save();renderNotes()};renderNotes()}
function renderNotes(){const q=(state.notes.search||"").trim().toLowerCase();const items=state.notes.items.filter(n=>!q||n.title.toLowerCase().includes(q)||n.content.toLowerCase().includes(q));$("#noteList").innerHTML=items.map(n=>'<div class="note-row '+(state.notes.activeId===n.id?"active":"")+'" data-note="'+n.id+'"><b>'+esc(n.title||"未命名筆記")+'</b><small>'+esc((n.content||"沒有內容").replace(/\n/g," ").slice(0,34))+'</small></div>').join("");$$("[data-note]").forEach(r=>r.onclick=()=>{state.notes.activeId=r.dataset.note;save();renderNotes()});const active=state.notes.items.find(n=>n.id===state.notes.activeId);$("#emptyNote").classList.toggle("hidden",!!active);$("#noteEditor").classList.toggle("hidden",!active);if(active){$("#noteTitle").value=active.title;$("#noteContent").value=active.content;$("#noteUpdated").textContent="最後更新 "+new Date(active.updated).toLocaleString("zh-TW",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"});$("#noteTitle").oninput=()=>{active.title=$("#noteTitle").value;active.updated=Date.now();save()};$("#noteContent").oninput=()=>{active.content=$("#noteContent").value;active.updated=Date.now();save()};$("#deleteNote").onclick=()=>{state.notes.items=state.notes.items.filter(n=>n.id!==active.id);state.notes.activeId=null;save();renderNotes()}}}

function mailAccounts(){return state.accountRegistry.accounts.filter(a=>a.serviceId.startsWith("mail."))}
function mailAccount(){return mailAccounts().find(a=>a.id===state.mail.activeAccount)||mailAccounts()[0]}
function mailBox(){const id=mailAccount()?.id;if(!id)return[];state.mail.boxes[id]=state.mail.boxes[id]||[];return state.mail.boxes[id]}
function mailMessage(id){return mailBox().find(m=>m.id===id)}
function mailStamp(){return new Date().toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit",hour12:false})}

function mountMail(){
 $("#appMount").innerHTML="";$("#appMount").appendChild($("#mailTemplate").content.cloneNode(true));
 $("[data-app-back]").onclick=()=>{state.phone.currentApp=null;showView("home")};
 const sel=$("#mailAccount");
 sel.innerHTML=mailAccounts().map(a=>'<option value="'+a.id+'">'+esc(a.displayName)+'</option>').join("");
 sel.value=state.mail.activeAccount;
 sel.onchange=()=>{state.mail.activeAccount=sel.value;state.mail.folder="inbox";state.mail.activeMessage=null;state.mail.mode="list";save();renderMail();renderAppLists()};
 $("#composeMail").onclick=()=>{state.mail.mode="compose";state.mail.activeMessage=null;save();renderMail()};
 renderMail();
}
function renderMail(){
 const acct=mailAccount();if(!acct)return;
 $("#mailAccount").value=acct.id;$("#mailAddress").textContent=acct.address;
 $("#mailFolders [data-folder]").forEach(b=>{b.classList.toggle("active",b.dataset.folder===state.mail.folder);b.onclick=()=>{state.mail.folder=b.dataset.folder;state.mail.activeMessage=null;state.mail.mode="list";save();renderMail()}});
 if(state.mail.mode==="compose"){renderMailCompose();return}
 if(state.mail.activeMessage){renderMailMessage();return}
 const msgs=mailBox().filter(m=>m.folder===state.mail.folder).slice().reverse();
 if(!msgs.length){
  $("#mailContent").innerHTML='<div class="mail-empty"><span>✉</span><b>這裡還沒有郵件</b><small>所有內容都是《人生》世界內的虛構資料。</small></div>';return;
 }
 $("#mailContent").innerHTML=msgs.map(m=>'<button class="mail-row '+(!m.read&&m.folder==="inbox"?"unread":"")+'" data-mail="'+m.id+'"><div class="mail-row-main"><b>'+esc(m.folder==="sent"||m.folder==="drafts"?"給："+(m.to||"—"):m.from||"—")+'</b><span>'+esc(m.subject||"（無主旨）")+'</span><small>'+esc((m.body||"").replace(/\n/g," ").slice(0,70))+'</small></div><time>'+esc(m.time||"")+'</time></button>').join("");
 $("[data-mail]").forEach(r=>r.onclick=()=>{const m=mailMessage(r.dataset.mail);if(!m)return;if(m.folder==="drafts"){state.mail.mode="compose";state.mail.activeMessage=m.id}else{state.mail.activeMessage=m.id;m.read=true}save();renderMail();renderAppLists()});
}
function renderMailMessage(){
 const m=mailMessage(state.mail.activeMessage);if(!m){state.mail.activeMessage=null;renderMail();return}
 $("#mailContent").innerHTML='<article class="mail-message"><div class="mail-message-head"><button id="mailBack">‹ 返回</button><h3>'+esc(m.subject||"（無主旨）")+'</h3><div class="mail-address-line">寄件人：'+esc(m.from||"—")+'<br>收件人：'+esc(m.to||"—")+'<br>'+esc(m.time||"")+'</div></div><div class="mail-message-body">'+esc(m.body||"")+'</div><div class="mail-message-actions"><button class="danger" id="trashMail">移到垃圾桶</button></div></article>';
 $("#mailBack").onclick=()=>{state.mail.activeMessage=null;save();renderMail()};
 $("#trashMail").onclick=()=>{m.folder="trash";state.mail.activeMessage=null;save();renderMail();renderAppLists()};
}
function renderMailCompose(){
 const editing=state.mail.activeMessage?mailMessage(state.mail.activeMessage):null;
 const draft=editing&&editing.folder==="drafts"?editing:{to:"",subject:"",body:""};
 $("#mailContent").innerHTML='<div class="mail-compose"><div class="mail-warning">世界內虛構郵箱：不要輸入真實帳號、密碼或私人資料。</div><label>寄件人<input id="mailFrom" disabled value="'+esc(mailAccount().address)+'"></label><label>收件人<input id="mailTo" value="'+esc(draft.to||"")+'" placeholder="name@example.local"></label><label>主旨<input id="mailSubject" value="'+esc(draft.subject||"")+'"></label><label>內容<textarea id="mailBody">'+esc(draft.body||"")+'</textarea></label><div class="mail-compose-actions"><button id="cancelCompose">取消</button><button id="saveDraft">存草稿</button><button class="send" id="sendMail">寄出</button></div></div>';
 $("#cancelCompose").onclick=()=>{state.mail.mode="list";state.mail.activeMessage=null;save();renderMail()};
 $("#saveDraft").onclick=()=>{
  const data={to:$("#mailTo").value,subject:$("#mailSubject").value,body:$("#mailBody").value};
  if(editing&&editing.folder==="drafts"){Object.assign(editing,data,{time:"草稿 · "+mailStamp()})}
  else{const id="draft-"+Date.now();mailBox().push({id,folder:"drafts",from:mailAccount().address,...data,time:"草稿 · "+mailStamp(),read:true})}
  state.mail.folder="drafts";state.mail.mode="list";state.mail.activeMessage=null;save();renderMail()
 };
 $("#sendMail").onclick=()=>{
  const to=$("#mailTo").value.trim(),subject=$("#mailSubject").value.trim(),body=$("#mailBody").value;
  if(!to){$("#mailTo").focus();return}
  if(editing&&editing.folder==="drafts")editing.folder="trash";
  mailBox().push({id:"sent-"+Date.now(),folder:"sent",from:mailAccount().address,to,subject,body,time:"剛剛",read:true});
  state.mail.folder="sent";state.mail.mode="list";state.mail.activeMessage=null;save();renderMail()
 };
}



function messageThread(id){return state.messages.threads.find(t=>t.id===id)}
function messageStamp(){return new Date().toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit",hour12:false})}
function mountMessages(){
 $("#appMount").innerHTML="";$("#appMount").appendChild($("#messagesTemplate").content.cloneNode(true));
 $("[data-app-back]").onclick=()=>{state.phone.currentApp=null;showView("home")};
 $("#newMessageThread").onclick=()=>{state.messages.mode="new";state.messages.activeThread=null;save();renderMessages()};
 renderMessages();
}
function renderMessages(){
 const mount=$("#messagesMount");if(!mount)return;
 if(state.messages.mode==="new"){renderNewMessageThread();return}
 const active=state.messages.activeThread?messageThread(state.messages.activeThread):null;
 if(active){renderConversation(active);return}
 mount.innerHTML='<div class="thread-list">'+state.messages.threads.map(t=>{
  const last=t.messages[t.messages.length-1];
  return '<button class="thread-row '+(t.unread?"unread":"")+'" data-thread="'+t.id+'"><span class="thread-avatar">'+esc((t.name||"?").slice(0,1))+'</span><span class="thread-main"><b>'+esc(t.name)+'</b><span>'+esc(last?.body||"尚無訊息")+'</span></span><span><time>'+esc(last?.time||"")+'</time>'+(t.unread?'<span class="thread-unread">'+t.unread+'</span>':"")+'</span></button>';
 }).join("")+'</div>';
 $("[data-thread]").forEach(b=>b.onclick=()=>{const t=messageThread(b.dataset.thread);if(!t)return;t.unread=0;state.messages.activeThread=t.id;state.messages.mode="list";save();renderMessages();renderAppLists()});
}
function renderConversation(t){
 const mount=$("#messagesMount");
 mount.innerHTML='<div class="conversation"><div class="conversation-head"><button id="threadBack">‹</button><div><b>'+esc(t.name)+'</b><small>'+esc(t.phone)+'</small></div><span></span></div><div class="message-stream" id="messageStream">'+t.messages.map(m=>'<div class="bubble '+(m.from==="me"?"me":"them")+'">'+esc(m.body)+'<time>'+esc(m.time||"")+'</time></div>').join("")+'</div><form class="message-compose" id="messageCompose"><input id="messageInput" autocomplete="off" placeholder="輸入訊息"><button>➤</button></form></div>';
 $("#threadBack").onclick=()=>{state.messages.activeThread=null;save();renderMessages()};
 $("#messageCompose").onsubmit=e=>{e.preventDefault();const input=$("#messageInput"),body=input.value.trim();if(!body)return;t.messages.push({id:"sms-"+Date.now(),from:"me",body,time:messageStamp()});input.value="";save();renderConversation(t)};
 const stream=$("#messageStream");stream.scrollTop=stream.scrollHeight;
}
function renderNewMessageThread(){
 const mount=$("#messagesMount");
 mount.innerHTML='<div class="new-thread"><div class="message-warning">這是《人生》世界內的虛構簡訊系統。電話號碼與聯絡人資料不連接真實服務。</div><label>聯絡人名稱<input id="newThreadName" placeholder="測試聯絡人"></label><label>電話號碼<input id="newThreadPhone" placeholder="+1 555 ..."></label><label>第一則訊息<input id="newThreadBody" placeholder="輸入訊息"></label><div class="new-thread-actions"><button id="cancelNewThread">取消</button><button class="start" id="startNewThread">開始對話</button></div></div>';
 $("#cancelNewThread").onclick=()=>{state.messages.mode="list";save();renderMessages()};
 $("#startNewThread").onclick=()=>{const name=$("#newThreadName").value.trim()||"未命名聯絡人",phone=$("#newThreadPhone").value.trim(),body=$("#newThreadBody").value.trim();if(!phone){$("#newThreadPhone").focus();return}const id="thread-"+Date.now();const messages=body?[{id:"sms-"+Date.now(),from:"me",body,time:messageStamp()}]:[];state.messages.threads.unshift({id,name,phone,unread:0,messages});state.messages.mode="list";state.messages.activeThread=id;save();renderMessages();renderAppLists()};
}

const WorldWebRegistry={
"home.local":{title:"世界瀏覽器",subtitle:"世界網路測試首頁"},
"school.local":{title:"學校網站",subtitle:"校園網站測試"},
"forum.local":{title:"學生論壇",subtitle:"學生論壇測試"},
"search.local":{title:"搜尋",subtitle:"世界內搜尋"}
};
function browserTab(){return state.browser.tabs.find(t=>t.id===state.browser.activeTab)||state.browser.tabs[0]}
function normalizeWorldUrl(raw){
 raw=(raw||"").trim();
 if(!raw)return "home.local";
 if(raw.startsWith("mail://")||raw.startsWith("message://"))return raw;
 raw=raw.replace(/^https?:\/\//i,"").replace(/\/$/,"");
 if(raw.includes(".")||raw.includes("?"))return raw;
 return "search.local?q="+encodeURIComponent(raw);
}
function browserTitle(url){
 const base=url.split("?")[0];
 return WorldWebRegistry[base]?.title||url;
}
function browserNavigate(raw,push=true){
 const url=normalizeWorldUrl(raw);
 if(url.startsWith("mail://")||url.startsWith("message://")){openDeepLink(url);return}
 const t=browserTab();if(!t)return;
 if(push){
  t.history=t.history.slice(0,t.historyIndex+1);
  t.history.push(url);t.historyIndex=t.history.length-1;
  state.browser.pageHistory=state.browser.pageHistory.filter(x=>x!==url);
  state.browser.pageHistory.unshift(url);state.browser.pageHistory=state.browser.pageHistory.slice(0,30);
 }
 t.url=url;save();renderBrowser();
}
function openDeepLink(uri){
 if(uri.startsWith("message://")){
  const threadId=uri.slice(10);
  const t=messageThread(threadId);
  if(t){t.unread=0;state.messages.activeThread=t.id;state.messages.mode="list";openApp("messages",true);renderAppLists()}
  return;
 }
 if(uri.startsWith("mail://")){
  const parts=uri.slice(7).split("/");
  const accountId=parts[0],messageId=parts[1];
  if(state.mail.boxes[accountId]){
   state.mail.activeAccount=accountId;
   state.mail.folder="inbox";
   state.mail.activeMessage=messageId||null;
   state.mail.mode="list";
   openApp("mail",true);
  }
 }
}
function mountBrowser(){
 $("#appMount").innerHTML="";$("#appMount").appendChild($("#browserTemplate").content.cloneNode(true));
 $("[data-app-back]").onclick=()=>{state.phone.currentApp=null;showView("home")};
 $("#newBrowserTab").onclick=()=>{
  const id="tab-"+Date.now();state.browser.tabs.push({id,url:"home.local",history:["home.local"],historyIndex:0});state.browser.activeTab=id;save();renderBrowser()
 };
 $("#browserBack").onclick=()=>{const t=browserTab();if(t&&t.historyIndex>0){t.historyIndex--;t.url=t.history[t.historyIndex];save();renderBrowser()}};
 $("#browserForward").onclick=()=>{const t=browserTab();if(t&&t.historyIndex<t.history.length-1){t.historyIndex++;t.url=t.history[t.historyIndex];save();renderBrowser()}};
 $("#browserReload").onclick=()=>renderBrowser();
 $("#browserAddressForm").onsubmit=e=>{e.preventDefault();browserNavigate($("#browserAddress").value,true)};
 $("#browserStar").onclick=()=>{const u=browserTab()?.url;if(!u)return;const i=state.browser.bookmarks.indexOf(u);if(i>=0)state.browser.bookmarks.splice(i,1);else state.browser.bookmarks.unshift(u);save();renderBrowser()};
 $("#browserPanel").onclick=()=>{state.browser.panelOpen=!state.browser.panelOpen;save();renderBrowserPanel()};
 renderBrowser();
}
function renderBrowser(){
 const t=browserTab();if(!t)return;
 $("#browserAddress").value=t.url;
 $("#browserBack").disabled=t.historyIndex<=0;
 $("#browserForward").disabled=t.historyIndex>=t.history.length-1;
 $("#browserStar").textContent=state.browser.bookmarks.includes(t.url)?"★":"☆";
 $("#browserTabs").innerHTML=state.browser.tabs.map(x=>'<button class="browser-tab '+(x.id===state.browser.activeTab?"active":"")+'" data-tab="'+x.id+'">'+esc(browserTitle(x.url))+'</button>').join("");
 $("#browserTabs [data-tab]").forEach(b=>b.onclick=()=>{state.browser.activeTab=b.dataset.tab;save();renderBrowser()});
 renderBrowserPanel();
 $("#browserContent").innerHTML=renderWorldPage(t.url);
 bindWorldLinks();
}
function renderBrowserPanel(){
 const panel=$("#browserPanelView");if(!panel)return;
 panel.classList.toggle("hidden",!state.browser.panelOpen);
 if(!state.browser.panelOpen)return;
 panel.innerHTML='<h4>書籤</h4>'+(state.browser.bookmarks.length?state.browser.bookmarks.map(u=>'<button data-browser-go="'+esc(u)+'">★ '+esc(u)+'</button>').join(""):'<button disabled>尚無書籤</button>')+'<h4>瀏覽紀錄</h4>'+state.browser.pageHistory.slice(0,10).map(u=>'<button data-browser-go="'+esc(u)+'">'+esc(u)+'</button>').join("");
 $("[data-browser-go]").forEach(b=>b.onclick=()=>{state.browser.panelOpen=false;browserNavigate(b.dataset.browserGo,true)});
}
function renderWorldPage(url){
 const [base,qs]=url.split("?");const params=new URLSearchParams(qs||"");
 if(base==="home.local")return '<section class="web-page"><span class="web-kicker">世界網路</span><h2>克萊爾灣瀏覽器</h2><p>這個瀏覽器只解析《人生》世界內網站，不會直接開啟真實網路。</p><div class="web-warning">目前網站名稱與網域為系統測試用，不代表正式世界觀名稱。</div><div class="web-card-grid"><button class="web-card" data-world-url="school.local"><b>學校網站</b><small>校曆、課表、規則與公告的未來入口。</small></button><button class="web-card" data-world-url="forum.local"><b>學生論壇</b><small>世界內學生論壇測試。</small></button><button class="web-card" data-world-url="mail://acct-test/tm1"><b>郵件深層連結</b><small>測試從網站直接打開指定郵件。</small></button><button class="web-card" data-world-url="search.local"><b>搜尋</b><small>搜尋已註冊的世界網站。</small></button></div></section>';
 if(base==="school.local")return '<section class="web-page"><span class="web-kicker">學校網站測試</span><h2>學校網站 Directory</h2><p>正式學校網站內容之後會由 世界網站登錄系統 提供；這裡先驗證 瀏覽器的頁面、書籤與導覽。</p><div class="web-card-grid"><div class="web-card"><b>校曆</b><small>校曆入口預留</small></div><div class="web-card"><b>課表</b><small>課表入口預留</small></div><div class="web-card"><b>校規</b><small>校規入口預留</small></div><div class="web-card"><b>社團</b><small>社團入口預留</small></div></div></section>';
 if(base==="forum.local")return '<section class="web-page"><span class="web-kicker">學生社群測試</span><h2>學生論壇</h2><p>論壇內容尚未正式製作，先保留已規劃的分類結構。</p><div class="forum-tags"><span>閒聊</span><span>功課</span><span>失物</span><span>社團</span><span>匿名</span><span>戀愛</span><span>二手</span><span>午餐</span></div></section>';
 if(base==="search.local"){const q=params.get("q")||"";const registry=Object.keys(WorldWebRegistry).filter(x=>x!=="search.local");const hits=q?registry.filter(u=>(u+" "+browserTitle(u)).toLowerCase().includes(q.toLowerCase())):registry;return '<section class="web-page"><span class="web-kicker">世界搜尋</span><h2>搜尋</h2><form class="web-search" id="worldSearchForm"><input id="worldSearchInput" value="'+esc(q)+'" placeholder="搜尋世界內網站"><button>搜尋</button></form>'+(hits.length?'<div class="web-card-grid">'+hits.map(u=>'<button class="web-card" data-world-url="'+u+'"><b>'+esc(browserTitle(u))+'</b><small>'+u+'</small></button>').join("")+'</div>':'<p>沒有找到已註冊網站。</p>')+'</section>'}
 return '<section class="web-page"><span class="web-kicker">找不到頁面</span><h2>找不到這個世界內網址</h2><p>'+esc(url)+'</p><button class="web-link" data-world-url="home.local">回到首頁</button></section>';
}
function bindWorldLinks(){
 $("[data-world-url]").forEach(b=>b.onclick=()=>browserNavigate(b.dataset.worldUrl,true));
 const f=$("#worldSearchForm");if(f)f.onsubmit=e=>{e.preventDefault();browserNavigate("search.local?q="+encodeURIComponent($("#worldSearchInput").value),true)};
}

function mountSettings(){$("#appMount").innerHTML="";$("#appMount").appendChild($("#settingsTemplate").content.cloneNode(true));$("[data-app-back]").onclick=()=>{state.phone.currentApp=null;showView("home")};$("#darkToggle").checked=!!state.settings.dark;$("#labelsToggle").checked=state.settings.showLabels!==false;$("#sessionCount").textContent=state.phone.sessions.length;$("#darkToggle").onchange=()=>{state.settings.dark=$("#darkToggle").checked;save();applySettings()};$("#labelsToggle").onchange=()=>{state.settings.showLabels=$("#labelsToggle").checked;save();applySettings()}}
function applySettings(){$("#screen").classList.toggle("dark",!!state.settings.dark);$("#homeScreen").classList.toggle("hide-labels",state.settings.showLabels===false);$("#drawerScreen").classList.toggle("hide-labels",state.settings.showLabels===false)}
renderAppLists();renderRecents();renderNotifications();applySettings();if(state.phone.open)openPhone();