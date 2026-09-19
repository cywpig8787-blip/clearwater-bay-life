const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY="clearwater-life-game-v1";

const defaultState={
  date:{year:2026,month:9,day:3},
  minutes:19*60,
  paused:true,
  locationId:"dorm_room",
  player:{name:"測試玩家"},
  selectedObject:null
};

let gameState=Object.assign({},defaultState,JSON.parse(localStorage.getItem(KEY)||"{}"));
gameState.date=Object.assign({},defaultState.date,gameState.date||{});
gameState.player=Object.assign({},defaultState.player,gameState.player||{});

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
        {id:"travel",label:"離開房間",travelTo:"dorm_hall"}
      ]}
    ]
  },
  dorm_hall:{
    id:"dorm_hall",
    name:"宿舍走廊",
    type:"hall",
    objects:[
      {id:"roomDoor",name:"房間門",hint:"返回宿舍房間",actions:[
        {id:"travel",label:"回到房間",travelTo:"dorm_room"}
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
 renderContextDrawer();
 renderWorldState();
}

const tip=$("#interactionTip");
function bindInteractables(){
 $$(".interactable").forEach(el=>{
   el.addEventListener("pointermove",e=>{
     const obj=currentScene().objects.find(o=>o.id===el.dataset.object);
     tip.textContent=(obj?.name||el.dataset.name)+" · "+(obj?.hint||"可互動");
     tip.classList.remove("hidden");
     tip.style.left=(e.clientX+14)+"px";
     tip.style.top=(e.clientY+14)+"px";
   });
   el.addEventListener("pointerleave",()=>tip.classList.add("hidden"));
   el.addEventListener("click",()=>openInteraction(el.dataset.object));
 });
}

function renderContextDrawer(){
 const scene=currentScene();
 $(".scene-actions").innerHTML=scene.objects.map(o=>
   '<button data-scene-object="'+o.id+'"><span>'+o.name+'</span><small>'+o.hint+'</small></button>'
 ).join("");
 $$("[data-scene-object]").forEach(b=>b.onclick=()=>openInteraction(b.dataset.sceneObject));
}

function openInteraction(objectId){
 const obj=currentScene().objects.find(o=>o.id===objectId);
 if(!obj)return;
 gameState.selectedObject=objectId;save();
 $("#panelContent").innerHTML=
   '<div class="fake-panel"><h2>'+obj.name+'</h2><p>'+obj.hint+'</p><div class="fake-list">'+
   obj.actions.map(a=>'<button data-action="'+a.id+'">'+a.label+'</button>').join("")+
   '</div></div>';
 $("#panelOverlay").classList.remove("hidden");
 $$("[data-action]").forEach((b,i)=>b.onclick=()=>runAction(obj,obj.actions[i]));
}

function runAction(obj,action){
 if(action.travelTo){closePanel();travelTo(action.travelTo);return}
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

function travelTo(sceneId){
 if(!scenes[sceneId])return;
 gameState.locationId=sceneId;
 gameState.selectedObject=null;
 advanceMinutes(2);
 showTransition(currentScene().name);
 renderScene();
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
   $("#panelContent").innerHTML='<div class="fake-panel"><h2>地圖</h2><p>目前先驗證地點切換與 World State。正式地圖美術之後替換。</p><div class="fake-list">'+
     Object.values(scenes).map(s=>'<button data-travel="'+s.id+'" '+(s.id===scene.id?"disabled":"")+'>'+s.name+(s.id===scene.id?"（目前）":"")+'</button>').join("")+
   '</div></div>';
   $("#panelOverlay").classList.remove("hidden");
   $$("[data-travel]").forEach(b=>b.onclick=()=>{closePanel();travelTo(b.dataset.travel)});
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
}
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

document.addEventListener("keydown",e=>{
 if(gameState.paused){
   e.preventDefault();
   return;
 }
 if(e.key==="Escape"){
   closePanel();closeAllPhone();
   left.classList.remove("open");right.classList.remove("open");
 }
 if(e.code==="Space"&&![ "INPUT","TEXTAREA","SELECT" ].includes(document.activeElement.tagName)){
   e.preventDefault();gameState.paused=true;save();renderWorldState();
 }
});

renderScene();
