import {locations,exits,travelSeconds} from './world.mjs';
import {WORLD_KEY,PLAYER_KEY,newWorld,validateWorld,accessReason,move,reserve,openLocker,clock,completeResidenceAssignment} from './engine.mjs';
const app=document.querySelector('#app');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state,checkResult=null,saveError='';
function empty(message){app.innerHTML=`<div class="empty"><p class="eyebrow">RAVENWOOD · 校園文本測試</p><h1>從你的角色開始</h1><p>${escape(message)}</p><p><a class="primary" href="../opening/">前往創角 v0.1</a></p></div>`;}
function save(){try{localStorage.setItem(WORLD_KEY,JSON.stringify(state));saveError='';}catch{saveError='本機存檔失敗，重新整理可能遺失進度。';}}
function init(){
  try {
    const source=JSON.parse(localStorage.getItem(PLAYER_KEY)||'null');
    if(!source?.player?.basic)return empty('請先完成創角，角色資料會接續到這裡。');
    if(source.player.school!=='coed')return empty('已保留你的角色。第一版僅開放 Ravenwood 校園，Rosamund 與 Avenor 尚未接入地圖。');
    let saved=null;
    try{saved=JSON.parse(localStorage.getItem(WORLD_KEY)||'null');}catch{saveError='校園存檔無法讀取，已重新開始校園測試。';}
    const characterId=source.createdAt||JSON.stringify(source.player);
    state=validateWorld(saved,characterId)?saved:newWorld(source.player,characterId);
    save();render();
  }catch(error){empty(error.message);}
}
function residenceActions(){
  if(state.locationId!=='admin'||state.player.residentialAccess)return '';
  if(['neutral','中性'].includes(state.player.gender))return '<p>Residence Assignment · 住宿分配：請選擇希望入住的住宿側。</p><button data-assignment="male_side">入住男生住宿側</button><button data-assignment="female_side">入住女生住宿側</button>';
  return '<button data-assignment="fixed">辦理住宿分配</button>';
}
function render(){
  const here=locations[state.locationId],time=clock(state);
  app.innerHTML=`<div class="layout"><aside class="status" aria-label="角色與時間">
    <p class="eyebrow">校園漫步 · 第一版</p><div class="clock">${time.time}</div><small>${time.date} · ${time.daysUntilOpening>0?`開學前 ${time.daysUntilOpening} 天`:'開學日已到 · 自由移動測試'}</small>
    <dl><dt>角色</dt><dd>${escape(state.player.name)}</dd><dt>住宿</dt><dd>${state.player.residentialAccess?`${state.player.buildingId} 宿舍 · ${state.player.residentialAccess==='male_side'?'男':'女'}側<br>201 雙人房`:'尚未分配 · 請到主校舍 1F 行政中心'}</dd><dt>目前位置</dt><dd>${escape(here.name)}</dd></dl>
    <label><input id="show-checks" type="checkbox" ${state.showChecks?'checked':''}>顯示 Development Check</label>
    <p class="save-status" role="status">${escape(saveError||'進度已自動保存')}</p><a href="../opening/">返回角色資料</a>
  </aside><article class="location-content"><p class="eyebrow">RAVENWOOD HIGH SCHOOL ${here.floor?`· ${here.floor}F`:''}</p><h1 tabindex="-1">${escape(here.name)}</h1>
    <p class="description">${escape(here.description)}</p>${here.seats?`<p class="muted">教室容量：${here.seats} 席</p>`:''}
    <div class="message" role="status">${escape(state.log[0])}</div>
    ${state.showChecks&&checkResult?.roll?`<p class="check">妙手 ${checkResult.skill} · 成功率 ${checkResult.chance}% · d100 ${checkResult.roll} · ${checkResult.success?'成功':'失敗'} · ${checkResult.seconds} 秒</p>`:''}
    <section class="section"><h2>Actions <small>行動</small></h2><div class="actions">${here.items.filter(i=>['locker','own-locker'].includes(i.kind)).map(i=>`<button data-locker="${i.id}">${i.kind==='own-locker'?'打開自己的置物櫃':state.openedLockers.includes(i.id)?'查看已開啟的置物櫃':'嘗試開鎖 · 妙手判定'}</button>`).join('')||residenceActions()||'<span class="muted">這裡目前沒有可執行的行動。</span>'}</div></section>
    <section class="section"><h2>People <small>人物</small></h2><p class="muted">${here.people.length?here.people.map(escape).join('、'):'目前沒有可互動的人物。'}</p></section>
    <section class="section"><h2>Items <small>物品</small></h2>${here.items.length?`<ul class="items">${here.items.map(i=>`<li>${escape(i.name)}${state.openedLockers.includes(i.id)?' · 已開啟（空）':''}</li>`).join('')}</ul>`:'<p class="muted">目前沒有可存取的物品。</p>'}</section>
    <section class="section"><h2>Move <small>移動</small></h2><div class="move-list">${exits(here.id).map(c=>{
      const reason=accessReason(state,c.to),target=locations[c.to];
      return `<div class="move-row"><button data-move="${c.to}" ${reason?'disabled':''}><span>${reason?'鎖定 · ':'→ '}${escape(target.name)}</span><small>${c.distanceMeters} m · ${travelSeconds(c)} 秒${c.mode==='stairs'?' · 樓梯':c.mode==='elevator'?' · 電梯':''}</small></button>${reason?`<p class="locked-reason">${escape(reason)}</p>`:''}${target.reservationRequired&&!state.reservations.includes(c.to)?`<button data-reserve="${c.to}">預約此會議室</button>`:''}</div>`;
    }).join('')}</div></section>
    <details class="section"><summary>最近行程</summary><ol class="journal">${state.log.map(l=>`<li>${escape(l)}</li>`).join('')}</ol></details>
    <footer>步行與操作才會推進時間。會議室預約在本次測試中持續有效；正式課表與人物行程尚未接入。</footer>
  </article></div>`;
  document.querySelector('#show-checks').onchange=e=>{state.showChecks=e.target.checked;save();render();};
}
app.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b||!state)return;
  try {
    if(b.dataset.move){move(state,b.dataset.move);checkResult=null;}
    else if(b.dataset.assignment)completeResidenceAssignment(state,b.dataset.assignment);
    else if(b.dataset.reserve)reserve(state,b.dataset.reserve);
    else if(b.dataset.locker)checkResult=openLocker(state,b.dataset.locker);
    else return;
    save();render();if(b.dataset.move)document.querySelector('h1').focus({preventScroll:false});
  }catch(error){const message=document.querySelector('.message');message.textContent=error.message;message.classList.add('error');}
});
init();
