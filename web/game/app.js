const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY="clearwater-life-game-v1";

const defaultState={
  date:{year:2026,month:9,day:3},
  minutes:19*60,
  paused:true,
  locationId:"dorm_room",
  player:{
    name:"測試玩家",
    positions:{
      dorm_room:{x:.50,y:.78},
      dorm_hall:{x:.50,y:.80}
    }
  },
  selectedObject:null
};

let gameState=Object.assign({},defaultState,JSON.parse(localStorage.getItem(KEY)||"{}"));
gameState.date=Object.assign({},defaultState.date,gameState.date||{});
gameState.player=Object.assign({},defaultState.player,gameState.player||{});
gameState.player.positions=Object.assign({},defaultState.player.positions,gameState.player.positions||{});

const scenes={
  dorm_room:{
    id:"dorm_room",
    name:"宿舍房間",
    type:"room",
    objects:[
      {id:"bed",name:"床",hint:"休息／睡覺",actions:[
        {id:"rest",label:"休息 30 分鐘",minutes:30},
        {id:"sleep",label:"睡覺 8 小時",minutes:480}
      ]},
      {id:"desk",name:"書桌",hint:"坐下／查看桌面",actions:[
        {id:"sit",label:"坐下"},
        {id:"inspect",label:"查看桌面"}
      ]},
      {id:"wardrobe",name:"衣櫃",hint:"整理衣物",actions:[
        {id:"organize",label:"整理衣物",minutes:15}
      ]},
      {id:"door",name:"房門",hint:"前往宿舍走廊",actions:[
        {id:"travel",label:"離開房間",travelTo:"dorm_hall",spawn:{x:.19,y:.79}}
      ]}
    ]
  },
  dorm_hall:{
    id:"dorm_hall",
    name:"宿舍走廊",
    type:"hall",
    objects:[
      {id:"roomDoor",name:"房間門",hint:"返回宿舍房間",actions:[
        {id:"travel",label:"回到房間",travelTo:"dorm_room",spawn:{x:.83,y:.78}}
      ]},
      {id:"notice",name:"公告欄",hint:"查看公告",actions:[
        {id:"inspect",label:"查看公告"}
      ]},
      {id:"stairs",name:"樓梯",hint:"前往其他樓層",actions:[
        {id:"locked",label:"其他樓層尚未接入"}
      ]}
    ]
  }
};

function save(){localStorage.setItem(KEY,JSON.stringify(gameState))}
function pad(n){return String(n).padStart(2,"0")}
function currentScene(){return scenes[gameState.locationId]||scenes.dorm_room}
function worldDate(){return new Date(gameState.date.year,gameState.date.month-1,gameState.date.day)}

const movementState={keys:new Set(),lastFrame:performance.now(),speed:255};
const sceneBounds={
 dorm_room:{minX:.06,maxX:.94,minY:.58,maxY:.89},
 dorm_hall:{minX:.06,maxX:.94,minY:.58,maxY:.90}
};
const INTERACTION_RANGE=105;

function playerPosition(){
 const id=currentScene().id;
 gameState.player.positions[id]=gameState.player.positions[id]||{x:.5,y:.8};
 return gameState.player.positions[id];
}
function setPlayerPosition(x,y,shouldSave=false){
 const bounds=sceneBounds[currentScene().id]||{minX:.05,maxX:.95,minY:.55,maxY:.9};
 const pos=playerPosition();
 pos.x=Math.max(bounds.minX,Math.min(bounds.maxX,x));
 pos.y=Math.max(bounds.minY,Math.min(bounds.maxY,y));
 const el=$("#playArea .player");
 if(el){
  el.style.left=(pos.x*100)+"%";
  el.style.top=(pos.y*100)+"%";
 }
 refreshNearbyState();
 if(shouldSave)save();
}
function gameplayInputBlocked(){
 return gameState.paused||
  !$("#panelOverlay").classList.contains("hidden")||
  !$("#phoneFullOverlay").classList.contains("hidden")||
  left?.classList.contains("open")||
  right?.classList.contains("open");
}
function objectDistance(objectId){
 const area=$("#playArea"),el=area?.querySelector('[data-object="'+objectId+'"]');
 if(!area||!el)return Infinity;
 const areaRect=area.getBoundingClientRect(),rect=el.getBoundingClientRect(),pos=playerPosition();
 const px=areaRect.left+pos.x*areaRect.width,py=areaRect.top+pos.y*areaRect.height;
 const dx=Math.max(rect.left-px,0,px-rect.right);
 const dy=Math.max(rect.top-py,0,py-rect.bottom);
 return Math.hypot(dx,dy);
}
function isObjectNearby(objectId){return objectDistance(objectId)<=INTERACTION_RANGE}
function nearbyObjects(){
 return currentScene().objects
  .map(o=>({object:o,distance:objectDistance(o.id)}))
  .filter(x=>x.distance<=INTERACTION_RANGE)
  .sort((a,b)=>a.distance-b.distance);
}
function refreshNearbyState(){
 $(".interactable").forEach(el=>{
  const near=isObjectNearby(el.dataset.object);
  el.classList.toggle("nearby",near);
  el.classList.toggle("out-of-range",!near);
  el.setAttribute("aria-disabled",String(!near));
 });
 renderContextDrawer();
}
function showRangeNotice(text="距離太遠，請先靠近。"){
 const pos=playerPosition(),area=$("#playArea");
 if(!area)return;
 tip.textContent=text;
 tip.classList.remove("hidden");
 tip.style.left=(pos.x*area.clientWidth+18)+"px";
 tip.style.top=(pos.y*area.clientHeight-115)+"px";
 clearTimeout(showRangeNotice.timer);
 showRangeNotice.timer=setTimeout(()=>tip.classList.add("hidden"),900);
}
function movePlayerFrame(now){
 const dt=Math.min(.04,(now-movementState.lastFrame)/1000||0);
 movementState.lastFrame=now;
 if(!gameplayInputBlocked()&&movementState.keys.size){
  let dx=0,dy=0;
  if(movementState.keys.has("ArrowLeft")||movementState.keys.has("KeyA"))dx-=1;
  if(movementState.keys.has("ArrowRight")||movementState.keys.has("KeyD"))dx+=1;
  if(movementState.keys.has("ArrowUp")||movementState.keys.has("KeyW"))dy-=1;
  if(movementState.keys.has("ArrowDown")||movementState.keys.has("KeyS"))dy+=1;
  if(dx||dy){
   const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;
   const area=$("#playArea"),pos=playerPosition();
   const nx=pos.x+dx*movementState.speed*dt/Math.max(1,area.clientWidth);
   const ny=pos.y+dy*movementState.speed*dt/Math.max(1,area.clientHeight);
   setPlayerPosition(nx,ny,false);
  }
 }
 requestAnimationFrame(movePlayerFrame);
}
requestAnimationFrame(movePlayerFrame);

function renderWorldState(){
  const h=Math.floor(gameState.minutes/60)%24,m=gameState.minutes%60;
  $("#timeDisplay").textContent=pad(h)+":"+pad(m);
  $("#dateDisplay").textContent=gameState.date.month+" 月 "+gameState.date.day+" 日";
  $("#weekdayDisplay").textContent=worldDate().toLocaleDateString("zh-TW",{weekday:"long"});
  $("#locationDisplay").textContent=currentScene().name;
  $("#pauseButton").classList.toggle("active",gameState.paused);
  $("#playButton").classList.toggle("active",!gameState.paused);
  syncPhonePeek();
  const lock=$("#pauseLock");
  if(lock){
    lock.classList.toggle("hidden",!gameState.paused);
    lock.setAttribute("aria-hidden",String(!gameState.paused));
  }
}
function addDays(days){
  const d=worldDate();d.setDate(d.getDate()+days);
  gameState.date={year:d.getFullYear(),month:d.getMonth()+1,day:d.getDate()};
}
function advanceMinutes(amount){
  const total=gameState.minutes+amount;
  if(total>=24*60)addDays(Math.floor(total/(24*60)));
  gameState.minutes=((total%(24*60))+(24*60))%(24*60);
  save();renderWorldState();
}
setInterval(()=>{if(!gameState.paused)advanceMinutes(1)},1800);

$("#pauseButton").onclick=()=>{gameState.paused=true;save();renderWorldState()};
$("#playButton").onclick=()=>{gameState.paused=false;save();renderWorldState()};
$("#resumeButton").onclick=()=>{gameState.paused=false;save();renderWorldState()};

function sceneMarkup(scene){
 if(scene.type==="hall"){
  return '<div class="hall-backdrop">'+
   '<div class="hall-door left interactable" data-object="roomDoor" data-name="房間門"></div>'+
   '<div class="notice-board interactable" data-object="notice" data-name="公告欄"></div>'+
   '<div class="stairs interactable" data-object="stairs" data-name="樓梯"></div>'+
   '<div class="hall-door right" aria-hidden="true"></div>'+
   '<div class="player" aria-label="玩家角色"><div class="head"></div><div class="body"></div></div>'+
  '</div>';
 }
 return '<div class="room-backdrop">'+
   '<div class="window"><span></span><span></span><span></span><span></span></div>'+
   '<div class="bed interactable" data-object="bed" data-name="床"></div>'+
   '<div class="desk interactable" data-object="desk" data-name="書桌"><div class="lamp"></div></div>'+
   '<div class="wardrobe interactable" data-object="wardrobe" data-name="衣櫃"></div>'+
   '<div class="door interactable" data-object="door" data-name="房門"></div>'+
   '<div class="rug"></div>'+
   '<div class="player" aria-label="玩家角色"><div class="head"></div><div class="body"></div></div>'+
  '</div>';
}

function renderScene(){
 const area=$("#playArea");
 const label=area.querySelector(".play-label");
 const tip=area.querySelector("#interactionTip");
 area.querySelector(".room-backdrop,.hall-backdrop")?.remove();
 area.insertAdjacentHTML("afterbegin",sceneMarkup(currentScene()));
 if(label)label.textContent="可遊玩區域";
 if(tip)tip.classList.add("hidden");
 bindInteractables();
 const pos=playerPosition();
 setPlayerPosition(pos.x,pos.y,false);
 renderContextDrawer();
 renderWorldState();
}

const tip=$("#interactionTip");
function bindInteractables(){
 $(".interactable").forEach(el=>{
   el.addEventListener("pointermove",e=>{
     const obj=currentScene().objects.find(o=>o.id===el.dataset.object);
     const near=isObjectNearby(el.dataset.object);
     tip.textContent=(obj?.name||el.dataset.name)+" · "+(near?(obj?.hint||"可互動"):"請先靠近");
     tip.classList.remove("hidden");
     tip.style.left=(e.clientX+14)+"px";
     tip.style.top=(e.clientY+14)+"px";
   });
   el.addEventListener("pointerleave",()=>tip.classList.add("hidden"));
   el.addEventListener("click",()=>{
    if(!isObjectNearby(el.dataset.object)){showRangeNotice();return}
    openInteraction(el.dataset.object);
   });
 });
 refreshNearbyState();
}

function renderContextDrawer(){
 const scene=currentScene(),mount=$(".scene-actions");if(!mount)return;
 mount.innerHTML=scene.objects.map(o=>{
  const near=isObjectNearby(o.id);
  return '<button data-scene-object="'+o.id+'" '+(near?"":"disabled")+'><span>'+o.name+'</span><small>'+(near?o.hint:"距離太遠")+'</small></button>';
 }).join("");
 $("[data-scene-object]").forEach(b=>b.onclick=()=>openInteraction(b.dataset.sceneObject));
}

function openInteraction(objectId){
 const obj=currentScene().objects.find(o=>o.id===objectId);
 if(!obj)return;
 if(!isObjectNearby(objectId)){showRangeNotice();return}
 gameState.selectedObject=objectId;save();
 $("#panelContent").innerHTML=
   '<div class="fake-panel"><h2>'+obj.name+'</h2><p>'+obj.hint+'</p><div class="fake-list">'+
   obj.actions.map(a=>'<button data-action="'+a.id+'">'+a.label+'</button>').join("")+
   '</div></div>';
 $("#panelOverlay").classList.remove("hidden");
 $$("[data-action]").forEach((b,i)=>b.onclick=()=>runAction(obj,obj.actions[i]));
}

function runAction(obj,action){
 if(action.travelTo){closePanel();travelTo(action.travelTo,action.spawn);return}
 if(action.minutes)advanceMinutes(action.minutes);
 let message="功能接口已觸發。";
 if(action.id==="rest")message="休息完成，世界時間前進 30 分鐘。";
 if(action.id==="sleep")message="睡眠測試完成，世界時間前進 8 小時。";
 if(action.id==="organize")message="整理衣物完成，世界時間前進 15 分鐘。";
 if(action.id==="inspect"&&obj.id==="desk")message="桌面互動接口正常；正式物品系統尚未接入。";
 if(action.id==="inspect"&&obj.id==="notice")message="公告欄接口正常；正式公告資料尚未接入。";
 if(action.id==="sit")message="角色動作接口正常；正式坐姿動畫尚未接入。";
 if(action.id==="locked")message="這個出口目前只作為未接入區域的占位。";
 $("#panelContent").innerHTML='<div class="fake-panel"><h2>'+obj.name+'</h2><p>'+message+'</p></div>';
 save();
}

function travelTo(sceneId,spawn=null){
 if(!scenes[sceneId])return;
 gameState.locationId=sceneId;
 gameState.selectedObject=null;
 if(spawn)gameState.player.positions[sceneId]={x:spawn.x,y:spawn.y};
 advanceMinutes(2);
 showTransition(currentScene().name);
 renderScene();
 save();
}
function showTransition(text){
 let layer=$(".scene-transition");
 if(!layer){
   $(".game-shell").insertAdjacentHTML("beforeend",'<div class="scene-transition"></div>');
   layer=$(".scene-transition");
 }
 layer.textContent=text;
 layer.classList.add("show");
 setTimeout(()=>layer.classList.remove("show"),260);
}

function openPanel(type){
 const scene=currentScene();
 if(type==="map"){
   $("#panelContent").innerHTML='<div class="fake-panel map-panel"><h2>地圖</h2><p>地圖只供查看位置與已知地點；不能從地圖直接傳送。</p><div class="map-location-list">'+
     Object.values(scenes).map(s=>'<div class="map-location '+(s.id===scene.id?"current":"")+'"><span class="map-dot"></span><div><b>'+s.name+'</b><small>'+(s.id===scene.id?"目前位置":"已知地點")+'</small></div></div>').join("")+
   '</div></div>';
   $("#panelOverlay").classList.remove("hidden");
   return;
 }
 const data={
  inventory:["背包","正式背包系統尚未接入。",["筆記本","鑰匙","水瓶"]],
  character:["人物","角色資料介面尚未接入。",["姓名："+gameState.player.name,"年級：高一","目前地點："+scene.name]],
  quests:["任務","正式任務系統尚未接入。",["入住宿舍","查看手機","熟悉房間"]],
  settings:["設定","正式遊戲設定尚未接入。",["音量","顯示","操作鍵位"]]
 };
 const item=data[type]||data.inventory;
 $("#panelContent").innerHTML='<div class="fake-panel"><h2>'+item[0]+'</h2><p>'+item[1]+'</p><div class="fake-list">'+item[2].map(x=>'<div>'+x+'</div>').join("")+'</div></div>';
 $("#panelOverlay").classList.remove("hidden");
}
function closePanel(){$("#panelOverlay").classList.add("hidden")}
$("#panelClose").onclick=closePanel;
$("#panelOverlay").onclick=e=>{if(e.target===$("#panelOverlay"))closePanel()};
$("#mapButton").onclick=()=>openPanel("map");
$$("[data-panel]").forEach(b=>b.onclick=()=>openPanel(b.dataset.panel));

const left=$("#leftDrawer"),right=$("#rightDrawer");
$("#leftDrawerToggle").onclick=()=>left.classList.toggle("open");
$("#rightDrawerToggle").onclick=()=>right.classList.toggle("open");
$("[data-close='left']").onclick=()=>left.classList.remove("open");
$("[data-close='right']").onclick=()=>right.classList.remove("open");

function syncPhonePeek(){
 const h=Math.floor(gameState.minutes/60)%24,m=gameState.minutes%60;
 const el=$("#phonePeekTime");
 if(el)el.textContent=pad(h)+":"+pad(m);
 const mount=$("#phonePeekNotifications");
 if(!mount)return;
 let phoneState={};
 try{phoneState=JSON.parse(localStorage.getItem("clearwater-life-phone-v2")||"{}")}catch(e){}
 let items=(phoneState.notifications?.items||[]).slice().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0,2);
 if(!items.length){
   const thread=(phoneState.messages?.threads||[]).find(t=>Number(t.unread)>0);
   const unreadMail=Object.entries(phoneState.mail?.boxes||{}).flatMap(([accountId,box])=>(box||[]).filter(m=>m.folder==="inbox"&&!m.read).map(m=>({accountId,...m})));
   if(thread){
     const last=thread.messages?.[thread.messages.length-1];
     items.push({appId:"messages",title:thread.name||"簡訊",body:last?.body||"你收到一則新簡訊"});
   }
   if(unreadMail[0])items.push({appId:"mail",title:unreadMail[0].from||"郵件",body:unreadMail[0].subject||"你有一封未讀郵件"});
 }
 mount.innerHTML=items.length?items.map(n=>{
   const label=n.appId==="messages"?"簡訊":n.appId==="mail"?"郵件":n.appId==="school"?"學校":"通知";
   return '<article><span class="peek-app">'+label+'</span><b>'+escapePeek(n.title||"新通知")+'</b><small>'+escapePeek(n.body||"")+'</small></article>';
 }).join(""):'<article><span class="peek-app">通知</span><b>目前沒有新通知</b><small>NPC 訊息與世界通知會顯示在這裡</small></article>';
}
function escapePeek(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function openPhonePeek(){
 if(gameState.paused)return;
 syncPhonePeek();
 $("#phonePeek").classList.remove("hidden");
}
function hidePhonePeek(){
 $("#phonePeek").classList.add("hidden");
}
function openFullPhone(){
 if(gameState.paused)return;
 syncPhonePeek();
 $("#phoneFullOverlay").classList.remove("hidden");
}
function closeFullPhone(){
 $("#phoneFullOverlay").classList.add("hidden");
 $("#phonePeek").classList.remove("hidden");
}
function closeAllPhone(){
 $("#phoneFullOverlay").classList.add("hidden");
 $("#phonePeek").classList.add("hidden");
}
$("#phoneButton").onclick=()=>{
 if(gameState.paused)return;
 if($("#phonePeek").classList.contains("hidden"))openPhonePeek();
 else openFullPhone();
};
$("#phonePeekOpen").onclick=openFullPhone;
$("#phonePeekHide").onclick=e=>{e.stopPropagation();hidePhonePeek()};
$("#phoneFullClose").onclick=closeFullPhone;
$("#phoneFullOverlay").onclick=e=>{if(e.target===$("#phoneFullOverlay"))closeFullPhone()};
window.addEventListener("storage",syncPhonePeek);
$("#phoneFrame")?.addEventListener("load",()=>setTimeout(syncPhonePeek,120));
setTimeout(syncPhonePeek,350);

document.addEventListener("keydown",e=>{
 const typing=[ "INPUT","TEXTAREA","SELECT" ].includes(document.activeElement.tagName);
 if(gameState.paused){
   e.preventDefault();
   return;
 }
 if(!typing&&["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)){
   movementState.keys.add(e.code);e.preventDefault();
 }
 if(e.key==="Escape"){
   closePanel();closeAllPhone();
   left.classList.remove("open");right.classList.remove("open");
 }
 if(!typing&&(e.code==="KeyE"||e.code==="Enter")){
   const nearest=nearbyObjects()[0];
   if(nearest){e.preventDefault();openInteraction(nearest.object.id)}
 }
 if(e.code==="Space"&&!typing){
   e.preventDefault();gameState.paused=true;movementState.keys.clear();save();renderWorldState();
 }
});
document.addEventListener("keyup",e=>movementState.keys.delete(e.code));
window.addEventListener("blur",()=>{movementState.keys.clear();save()});

renderScene();
