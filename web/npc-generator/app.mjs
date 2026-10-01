import {fields,modes,pools,styles,families,createState,restore,roll,textFor,issues,lockAll,unlockAll,clearCharacter} from './engine.mjs';
const key='cbl-npc-generator-v2';
let state=createState();let storageOK=true;let migrated=false;
try{const raw=JSON.parse(localStorage.getItem(key));migrated=raw?.version===2;state=restore(raw);}catch{storageOK=false;}
const $=s=>document.querySelector(s),grid=$('#grid'),cards=new Map();
for(const f of fields){
 const card=document.createElement('article');card.className='card';card.dataset.field=f.id;
 const top=document.createElement('div'),label=document.createElement('div'),value=document.createElement('div'),group=document.createElement('span');
 label.className='label';label.textContent=f.label;group.className='group-label';group.textContent=f.group;label.append(group);value.className='value';value.textContent='？？？';top.append(label,value);
 const tools=document.createElement('div');tools.className='tools';
 const lock=document.createElement('button');lock.className='lock';lock.textContent='鎖定';lock.setAttribute('aria-label','鎖定 '+f.label);
 const single=document.createElement('button');single.className='mini';single.textContent='單抽';single.setAttribute('aria-label','單抽 '+f.label);
 tools.append(lock,single);
 card.append(top,tools);grid.append(card);cards.set(f.id,{card,value,lock,single});
 lock.onclick=()=>{state.locked[f.id]=!state.locked[f.id];save();render();};
 single.onclick=()=>generate(f.id);
}
function save(){try{localStorage.setItem(key,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}$('#saveState').textContent=storageOK?' 本機紀錄已保存。':' 此瀏覽器無法保存，請匯出喜歡的角色。';}
function render(){
 const vis=new Set(modes[state.mode]);
 for(const f of fields){const c=cards.get(f.id),v=state.values[f.id];c.card.hidden=!vis.has(f.id);c.value.textContent=v?.label||'？？？';c.card.classList.toggle('long',(v?.label.length||0)>35);c.card.classList.toggle('locked',!!state.locked[f.id]);c.lock.disabled=!v;c.lock.classList.toggle('on',!!state.locked[f.id]);c.lock.textContent=state.locked[f.id]?'已鎖定':'鎖定';c.lock.setAttribute('aria-pressed',String(!!state.locked[f.id]));c.single.disabled=!!state.locked[f.id];}
 for(const b of document.querySelectorAll('[data-mode]')){b.classList.toggle('active',b.dataset.mode===state.mode);b.setAttribute('aria-pressed',String(b.dataset.mode===state.mode));}
 const v=state.values;
 const notes=issues(state);$('#warnings').hidden=!notes.length;$('#warnings').textContent=notes.join(' ');
 $('#copy').disabled=$('#download').disabled=!v.core;
 $('#log').textContent=state.history.length?state.history.map(h=>textFor({values:h.values,count:h.number,mode:'all'})).join('\n\n────────────\n\n'):'尚未煉成。';
}
function generate(only=null){try{const r=roll(state,{only});state=r.state;save();render();const linked=r.changed.filter(x=>x!==only);$('#notice').textContent=r.changed.length?(only?`已單抽「${fields.find(f=>f.id===only).label}」${linked.length?'，並更新 '+linked.length+' 個未鎖定的連動欄位':''}。`:`第 ${state.count} 次煉成。喜歡的欄位鎖住，再繼續骰。`):'欄位已鎖定；解鎖想更換的欄位即可。';}catch(e){$('#notice').textContent='這次沒有改動人物：'+e.message;}}
$('#spin').onclick=()=>generate();
for(const b of document.querySelectorAll('[data-mode]'))b.onclick=()=>{state.mode=b.dataset.mode;$('#arch').hidden=true;$('#archBtn').setAttribute('aria-expanded','false');save();render();};
$('#archBtn').onclick=()=>{const open=$('#arch').hidden;$('#arch').hidden=!open;$('#archBtn').setAttribute('aria-expanded',String(open));};
$('#lockAll').onclick=()=>{state=lockAll(state);save();render();$('#notice').textContent='已全部鎖定，人物內容保留。';};
$('#unlock').onclick=()=>{state=unlockAll(state);save();render();$('#notice').textContent='已全部解鎖，人物內容保留。';};
$('#clear').onclick=()=>{state=clearCharacter(state);$('#arch').hidden=true;$('#archBtn').setAttribute('aria-expanded','false');save();render();$('#notice').textContent='目前角色已清空，考古紀錄保留。按「煉成」生成新角色。';};
$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(textFor(state));$('#notice').textContent='外貌描述已複製，可以貼回對話繼續設計。';}catch{$('#arch').hidden=false;$('#archBtn').setAttribute('aria-expanded','true');$('#notice').textContent='瀏覽器未允許複製，可從考古紀錄選取文字或匯出人物。';}};
function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#download').onclick=()=>download(textFor(state),'appearance-'+state.count+'.txt');
$('#exportHistory').onclick=()=>download($('#log').textContent,'appearance-history.txt');
$('#poolCount').textContent=`${Object.values(pools).reduce((n,p)=>n+p.length,0)} 外貌選項／組合 · ${styles.length} 穿搭風格 · ${fields.length} 欄`;
save();render();

if(migrated)$('#notice').textContent='已將本機舊紀錄清理為純外貌資料；無法對應的新欄位請按「煉成」補齊。';
