import {eligibleSchools} from '../creation-v2/school-eligibility.mjs?v=cyw51-r10';
import {saveSchoolDesk,confirmSchool} from '../creation-v2/player-state.mjs?v=cyw51-r12-final';
import {schoolContent} from './school-content.mjs?v=cyw51-r12-final';
import {DocumentMotion} from './document-motion.mjs?v=cyw51-r12-final';
import {documentPose,loadSchoolFont,prepareSchoolResources} from './presentation.mjs?v=cyw51-r12-final';
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const assets=new URL('./assets/',import.meta.url);
function bodyMarkup(blocks){let result='',list=false;for(const b of blocks){if(b.type==='li'){if(!list){result+='<ul>';list=true;}result+='<li>'+esc(b.text)+'</li>';}else{if(list){result+='</ul>';list=false;}result+=`<${b.type==='h'?'h3':'p'}>${esc(b.text)}</${b.type==='h'?'h3':'p'}>`;}}return result+(list?'</ul>':'');}

// Presentation factory also used by isolated 1/2/3-paper acceptance fixtures.
// Production calls it only after eligibility has produced the complete set.
export function createSchoolPaper(id,index,count){
 const d=schoolContent[id],sheet=document.createElement('article');
 sheet.className='school-sheet '+id;sheet.dataset.school=id;sheet.dataset.fontStatus='loading';sheet.dataset.copyStatus=d.copyStatus;
 sheet.style.zIndex=String(3+index);Object.assign(sheet.style,documentPose(index,count));
 const identity=`<div class="sheet-crest"><img src="${new URL(d.asset+'-source.jpg',assets)}" alt="${esc(d.zh)}校徽" draggable="false"></div><h2 lang="en">${esc(d.name)}</h2><p class="school-zh">${esc(d.zh)}</p>`;
 sheet.innerHTML=`<img class="sheet-paper" src="${new URL(d.asset+'-paper.png',assets)}" width="1024" height="1536" alt="${esc(d.zh)}空白文件模板" draggable="false"><div class="document-metadata" lang="en">${id==='coed'?'FORM / 09 · ADMISSIONS OFFICE':id==='boys'?'ADMISSIONS / 09 <span>REV. —</span>':'Admissions Office'}</div><div class="desk-identity" aria-hidden="true">${identity}</div><button type="button" class="sheet-hit" aria-label="拿起${esc(d.zh)}文件" disabled><span>拿起閱讀</span></button><div class="sheet-content" inert aria-hidden="true"><header class="sheet-identity">${identity}</header><p class="sheet-subtitle" lang="en">${esc(d.subtitle)}</p><div class="sheet-copy" tabindex="0" role="region" aria-label="${esc(d.zh)}入學資訊">${bodyMarkup(d.blocks)}<div class="copy-placeholder-lines" aria-hidden="true"></div></div><div class="sheet-actions"><button type="button" class="document-action put-down">放回桌面</button><button type="button" class="document-action confirm-enrollment">選擇此校 <span aria-hidden="true">✓</span></button></div></div>`;
 return sheet;
}
export function showSchoolSelection(initial,{storage=localStorage,staged=false}={}){
 if(!staged){document.querySelector('#creator').hidden=true;document.querySelector('#rotateGate').hidden=true;}
 let root=document.querySelector('#schoolSelection');
 // Creator's viewport listener must not rebuild this scene or restore stale state mid-animation.
 if(root&&!root.hidden&&root.dataset.runId===initial.runId)return;
 if(!root){root=document.createElement('section');root.id='schoolSelection';document.body.append(root);}
 root.hidden=staged;root.dataset.runId=initial.runId;root.dataset.view='desk';root.dataset.resources='loading';
 let state=initial,active=null,updateStackLabel=()=>{};
 if(state.phase==='school-confirmed'){showOpening(root,state);return;}
 const allowed=eligibleSchools(state.creatorResult,state.run),saved=state.schoolDesk;
 const order=saved?.order?.length===allowed.length&&new Set(saved.order).size===allowed.length&&saved.order.every(id=>allowed.includes(id))?[...saved.order]:allowed;
 const desk={order,readingSchool:allowed.includes(saved?.readingSchool)?saved.readingSchool:null,scroll:{...saved?.scroll}};
 root.innerHTML='<div class="desk-layer" aria-hidden="true"></div><header class="desk-heading"><h1>入學文件</h1><p>拿起桌上的文件，閱讀後決定。</p></header><div class="paper-layer"></div><div class="transition-layer" aria-hidden="true"></div><div class="school-status" role="status"><span></span><button type="button" class="retry-assets" hidden>重新載入文件</button></div><div class="school-rotate">請將裝置旋轉為橫向<br><small>讓文件平放在眼前。</small></div>';
 const status=text=>{root.querySelector('.school-status span').textContent=text;};
 const persist=()=>{try{state=saveSchoolDesk(state,desk,storage);status('');return true;}catch(e){status('保存失敗：'+e.message);return false;}};
 const curtain=root.querySelector('.transition-layer'),layer=root.querySelector('.paper-layer'),sheets=new Map();
 const motion=new DocumentMotion({onMeasure:m=>{root.dataset.lastTransitionMs=m.durationMs.toFixed(1);root.dispatchEvent(new CustomEvent('document-transition-measure',{detail:m}));},onState:s=>{root.dataset.documentState=s;root.setAttribute('aria-busy',String(!['desk','reading','opening'].includes(s)));}});motion.set('desk');
 const pose=(id,reading=false)=>documentPose(order.indexOf(id),order.length,reading);
 const changeView=view=>{root.dataset.view=view;for(const [id,sheet] of sheets){if(id===active)continue;Object.assign(sheet.style,view==='reading'?{...pose(id,true),transform:pose(id,true).transform+' translate(9px, 7px) rotate(2deg) scale(.99)'}:pose(id));}};
 for(const id of order){
  const sheet=createSchoolPaper(id,order.indexOf(id),order.length);layer.append(sheet);sheets.set(id,sheet);
  const copy=sheet.querySelector('.sheet-copy');copy.scrollTop=desk.scroll[id]||0;
  sheet.querySelector('.sheet-hit').onclick=()=>pick(id);
  sheet.querySelector('.put-down').onclick=()=>put();
  sheet.querySelector('.confirm-enrollment').onclick=()=>enroll(id);
  copy.addEventListener('scroll',()=>{desk.scroll[id]=copy.scrollTop;},{passive:true});
  copy.addEventListener('scrollend',()=>persist());
 }
 async function prepare(){
  root.dataset.resources='loading';status('正在準備入學文件…');root.querySelector('.retry-assets').hidden=true;
  try{
   await prepareSchoolResources(order);
   await Promise.all([...sheets].map(async([id,sheet])=>{
    await Promise.all([loadSchoolFont(id),...Array.from(sheet.querySelectorAll('img'),img=>img.decode())]);
    sheet.dataset.fontStatus='loaded';
   }));
   root.dataset.resources='ready';status('');for(const sheet of sheets.values())sheet.querySelector('.sheet-hit').disabled=false;
   if(desk.readingSchool)await pick(desk.readingSchool);
  }catch(e){root.dataset.resources='error';status('文件圖片或正式字體未能載入，請重試。'+e.message);root.querySelector('.retry-assets').hidden=false;return false;}
  return true;
 }
 root.querySelector('.retry-assets').onclick=()=>prepare();const ready=prepare();
 async function pick(id){
  if(root.dataset.resources!=='ready'||motion.busy||motion.state!=='desk')return;
  active=id;updateStackLabel(id);const sheet=sheets.get(id),content=sheet.querySelector('.sheet-content');
  for(const s of sheets.values())s.querySelector('.sheet-hit').disabled=true;
  sheet.dataset.active='true';sheet.style.zIndex='10';
  await motion.pick(sheet,content,pose(id),pose(id,true),curtain,changeView);
  desk.readingSchool=id;persist();sheet.querySelector('.sheet-copy').focus({preventScroll:true});
 }
 async function put(){
  if(motion.busy||!active||motion.state!=='reading')return;
  const id=active,sheet=sheets.get(id);desk.scroll[id]=sheet.querySelector('.sheet-copy').scrollTop;
  await motion.put(sheet,sheet.querySelector('.sheet-content'),pose(id),curtain,changeView);
  sheet.style.zIndex=String(3+order.indexOf(id));delete sheet.dataset.active;
  for(const s of sheets.values())s.querySelector('.sheet-hit').disabled=false;
  active=null;desk.readingSchool=null;persist();sheet.querySelector('.sheet-hit').focus({preventScroll:true});
 }
 function enroll(id){
  if(motion.busy||motion.state!=='reading'||active!==id)return;
  const sheet=sheets.get(id),confirmation=document.createElement('dialog');
  confirmation.className='enrollment-dialog';confirmation.setAttribute('aria-labelledby','enrollment-title');
  confirmation.innerHTML=`<h2 id="enrollment-title">確認就讀${esc(schoolContent[id].zh)}？</h2><p>提交後，本局將依這份入學文件進入該校的報到流程。</p><div class="actions"><button type="button" class="document-action cancel">繼續閱讀</button><button type="button" class="document-action accept">確認學校 ✓</button></div><p role="alert"></p>`;
  sheet.append(confirmation);confirmation.querySelector('.cancel').onclick=()=>confirmation.close();confirmation.onclose=()=>confirmation.remove();
  confirmation.querySelector('.accept').onclick=async()=>{
   try{state=confirmSchool(state,id,storage);}catch(e){confirmation.querySelector('[role=alert]').textContent='保存失敗：'+e.message;return;}
   confirmation.close();sheet.querySelector('.sheet-content').inert=true;
   await motion.mask(curtain,{kind:'enrollment',final:'opening',
    before:()=>motion.animate(sheet,[{opacity:'1',transform:sheet.style.transform},{opacity:'0',transform:'translate(-50%,-90%) scale(.85)'}],160),
    swap:()=>showOpening(root,state)
   });

  };
  confirmation.showModal();
 }
 if(order.length>1){
  const nav=document.createElement('nav');nav.className='stack-navigation';nav.setAttribute('aria-label','學校文件翻閱');
  nav.innerHTML='<button class="document-action" aria-label="上一份學校文件">←</button><span></span><button class="document-action" aria-label="下一份學校文件">→</button>';
  root.append(nav);let current=order.length-1;
  const label=()=>nav.querySelector('span').textContent=`${current+1} / ${order.length}`;updateStackLabel=id=>{current=order.indexOf(id);label();};label();
  async function turn(direction){
   if(motion.busy||root.dataset.resources!=='ready')return;
   const reading=motion.state==='reading',from=active||order[current],target=(order.indexOf(from)+direction+order.length)%order.length,to=order[target];
   const old=sheets.get(from),next=sheets.get(to),oldContent=old.querySelector('.sheet-content'),nextContent=next.querySelector('.sheet-content');
   motion.busy=true;motion.set('flipping');oldContent.inert=true;oldContent.ariaHidden='true';nextContent.inert=true;
   try{
    await Promise.all([motion.animate(oldContent,[{opacity:oldContent.style.opacity||'0'},{opacity:'0'}],80),motion.animate(old,[{transform:old.style.transform},{transform:old.style.transform+' translateX('+(-direction*12)+'%) rotate('+(-direction*3)+'deg)',filter:'drop-shadow(0 20px 14px #0009)'}],160)]);
    delete old.dataset.active;Object.assign(old.style,pose(from));old.style.zIndex='3';
    next.dataset.active=reading?'true':'false';next.style.zIndex='10';
    const final=pose(to,reading);await motion.animate(next,[{...final,transform:final.transform+' translateY(-6%) rotate('+direction*3+'deg)'},final],200);
    if(reading){nextContent.style.opacity='1';nextContent.inert=false;nextContent.ariaHidden='false';active=to;desk.readingSchool=to;changeView('reading');}
    current=target;label();motion.set(reading?'reading':'desk');persist();
   }finally{motion.busy=false;}
  }
  nav.querySelector('button:first-child').onclick=()=>turn(-1);nav.querySelector('button:last-child').onclick=()=>turn(1);
 }
 root.onkeydown=e=>{if(e.key==='Escape'&&!root.querySelector('dialog[open]'))put();};
 return {root,ready};
}
function showOpening(root,state){
 const d=schoolContent[state.selectedSchool];root.dataset.documentState='opening';root.setAttribute('aria-busy','false');root.dataset.openingRoute=state.openingFlow.route;
 const lines={coed:['「Ravenwood High School（雷文伍德高中）。」','對方確認了一遍你填寫的學校名稱，拿起筆，在表格右下角留下簽記。','「好。你的入學資料會直接轉交給學校。」','他翻到另一張文件，確認了幾行資料。','「你是國際學生，所以住宿也會一起安排。到了那裡，先去新生住宿報到處，他們會告訴你接下來該去哪裡。」','文件被重新疊好。','「行李記得帶在身邊。今天大概還要跑幾個地方。」'],boys:['「Avenor Boys’ Academy（阿維諾男子學院）。」','對方看了一眼表格，又抬頭確認了一次你的資料。','「好，資料沒有問題。」','他在文件上簽名，隨後從旁邊抽出另一張薄薄的資料頁，夾進你的入學文件。','「Avenor 的住宿安排和其他學校不太一樣。你到了之後，還要決定是住學校宿舍，還是在校外居住。」','「現在不用選。到那裡之後，他們會把兩種方式都告訴你。」','他將文件邊緣對齊，放進資料夾。','「所以，在找到今晚睡哪裡以前，先別把行李弄丟了。」'],girls:['「Rosamund Girls’ Academy（羅莎蒙德女子學院）。」','對方的目光停在學校名稱上。','「……好。」','他沒有立刻把文件收走，而是重新確認了一次你的姓名與入學資料。','接著，一枚印章落在紙面上。','「到了學校以後，不用先去宿舍。」','他把表格收入文件夾。','「直接去大禮堂。」','你大概露出了些疑惑。','對方像是早就看過很多次這種表情。','「放心，你沒有漏掉什麼程序。」','「Rosamund 的新生都是這樣。」']};
 const opening=document.createElement("div");opening.innerHTML=`<article class="opening-receipt" tabindex="-1"><h1>${esc(d.zh)}</h1><p>你將填好的表格推回桌子的另一側。</p><p>對方低頭看了一眼，在學校名稱旁停了片刻。</p><p>紙張翻動的聲音在安靜的房間裡格外清楚。</p>${lines[state.selectedSchool].map(p=>'<p>'+esc(p)+'</p>').join('')}<small>入學資料已保存。此版試玩至文件交件；後續報到內容將接續開放。</small></article>`;
 for(const child of [...root.children])if(!child.classList.contains('transition-layer'))child.remove();root.prepend(opening);
 root.querySelector('article').focus();root.dispatchEvent(new CustomEvent('school-opening-ready',{bubbles:true,detail:{playerState:state,route:state.openingFlow.route}}));
}
