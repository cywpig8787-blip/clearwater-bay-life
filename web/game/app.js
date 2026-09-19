const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let paused=true;
let minutes=19*60;
function pad(n){return String(n).padStart(2,"0")}
function renderTime(){const h=Math.floor(minutes/60)%24,m=minutes%60;$("#timeDisplay").textContent=pad(h)+":"+pad(m)}
setInterval(()=>{if(!paused){minutes=(minutes+1)%(24*60);renderTime()}},1800);

$("#pauseButton").onclick=()=>{paused=true;$("#pauseButton").classList.add("active");$("#playButton").classList.remove("active")};
$("#playButton").onclick=()=>{paused=false;$("#playButton").classList.add("active");$("#pauseButton").classList.remove("active")};

function openPanel(type){
 const data={
  map:["地圖","這裡之後會接正式區域／世界地圖。","目前所在地：宿舍房間","校園區域：尚未接線"],
  inventory:["背包","正式背包系統尚未接入。","筆記本","鑰匙","水瓶"],
  character:["人物","角色資料介面尚未接入。","姓名：測試玩家","年級：高一","目前狀態：正常"],
  quests:["任務","正式任務系統尚未接入。","入住宿舍","查看手機","熟悉房間"],
  settings:["設定","正式遊戲設定尚未接入。","音量","顯示","操作鍵位"]
 };
 const item=data[type]||data.map;
 $("#panelContent").innerHTML='<div class="fake-panel"><h2>'+item[0]+'</h2><p>'+item[1]+'</p><div class="fake-list">'+item.slice(2).map(x=>'<div>'+x+'</div>').join("")+'</div></div>';
 $("#panelOverlay").classList.remove("hidden");
}
$("#panelClose").onclick=()=>$("#panelOverlay").classList.add("hidden");
$("#panelOverlay").onclick=e=>{if(e.target===$("#panelOverlay"))$("#panelOverlay").classList.add("hidden")};
$("#mapButton").onclick=()=>openPanel("map");
$$("[data-panel]").forEach(b=>b.onclick=()=>openPanel(b.dataset.panel));

const left=$("#leftDrawer"),right=$("#rightDrawer");
$("#leftDrawerToggle").onclick=()=>left.classList.toggle("open");
$("#rightDrawerToggle").onclick=()=>right.classList.toggle("open");
$("[data-close='left']").onclick=()=>left.classList.remove("open");
$("[data-close='right']").onclick=()=>right.classList.remove("open");

$("#phoneButton").onclick=()=>$("#phoneOverlay").classList.remove("hidden");
$("#phoneClose").onclick=()=>$("#phoneOverlay").classList.add("hidden");
$("#phoneOverlay").onclick=e=>{if(e.target===$("#phoneOverlay"))$("#phoneOverlay").classList.add("hidden")};

const tip=$("#interactionTip");
$$(".interactable").forEach(el=>{
 el.addEventListener("pointermove",e=>{
  tip.textContent=el.dataset.name+" · 可互動";
  tip.classList.remove("hidden");
  tip.style.left=(e.clientX+14)+"px";
  tip.style.top=(e.clientY+14)+"px";
 });
 el.addEventListener("pointerleave",()=>tip.classList.add("hidden"));
 el.addEventListener("click",()=>showInteraction(el.dataset.name));
});
$$("[data-scene-action]").forEach(b=>b.onclick=()=>showInteraction(b.dataset.sceneAction));

function showInteraction(name){
 const actionMap={
  "床":["休息","睡覺"],
  "書桌":["坐下","查看桌面"],
  "衣櫃":["整理衣物"],
  "房門":["離開房間"]
 };
 const actions=actionMap[name]||["互動"];
 $("#panelContent").innerHTML='<div class="fake-panel"><h2>'+name+'</h2><p>目前先驗證場景互動入口，正式行為與世界狀態尚未接入。</p><div class="fake-list">'+actions.map(a=>'<div>'+a+'</div>').join("")+'</div></div>';
 $("#panelOverlay").classList.remove("hidden");
}
renderTime();
