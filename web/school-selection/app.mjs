import {eligibleSchools} from '../creation-v2/school-eligibility.mjs?v=cyw51-r10';
import {saveSchoolDesk,confirmSchool} from '../creation-v2/player-state.mjs?v=cyw51-r10';
import {schoolContent} from './school-content.mjs?v=cyw51-r10';
import {DocumentMotion} from './document-motion.mjs?v=cyw51-r10';
import {decorateButtons,assetIcon} from '../opening/button-assets.mjs?v=cyw51-r10';
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const assets=new URL('./assets/',import.meta.url);
function bodyMarkup(blocks){let result='',list=false;for(const b of blocks){if(b.type==='li'){if(!list){result+='<ul>';list=true;}result+='<li>'+esc(b.text)+'</li>';}else{if(list){result+='</ul>';list=false;}result+=`<${b.type==='h'?'h3':'p'}>${esc(b.text)}</${b.type==='h'?'h3':'p'}>`;}}return result+(list?'</ul>':'');}
export function showSchoolSelection(initial,{storage=localStorage}={}){
 let state=initial,active=null;
 document.querySelector('#creator').hidden=true;document.querySelector('#rotateGate').hidden=true;
 let root=document.querySelector('#schoolSelection');if(!root){root=document.createElement('section');root.id='schoolSelection';document.body.append(root);}root.hidden=false;
 const allowed=eligibleSchools(state.creatorResult,state.run);
 const saved=state.schoolDesk;
 const order=saved?.order?.length===allowed.length&&new Set(saved.order).size===allowed.length&&saved.order.every(id=>allowed.includes(id))?[...saved.order]:allowed;
 const desk={order,readingSchool:allowed.includes(saved?.readingSchool)?saved.readingSchool:null,scroll:{...saved?.scroll}};
 const status=text=>{root.querySelector('#schoolStatus').textContent=text;};
 const persist=()=>{try{state=saveSchoolDesk(state,desk,storage);status('');return true;}catch(e){status('保存失敗：'+e.message);return false;}};
 if(state.phase==='school-confirmed'){showOpening(root,state);return;}
 root.innerHTML='<header class="desk-heading"><h1>入學文件</h1><p>你的角色資料已保存。<br>拿起桌上的文件閱讀，再確認就讀學校。</p></header><div id="schoolStatus" role="status"></div>';
 const motion=new DocumentMotion({onState:s=>{root.dataset.documentState=s;}});motion.set('desk');
 const sheets=new Map();
 function pose(id,reading=false){const n=order.indexOf(id),count=order.length;return {transform:`translate(-50%, -50%) translate(${reading?0:(n-(count-1)/2)*185}px, ${reading?0:n*26+30}px) rotate(${reading?0:(count===1?-3:n===0?-7:6)}deg) scale(${reading?1:.61})`,filter:reading?'drop-shadow(0 24px 22px #0009)':'drop-shadow(0 5px 3px #0009)'};}
 for(const id of allowed){const d=schoolContent[id],sheet=document.createElement('article');sheet.className='school-sheet '+id;sheet.dataset.school=id;sheet.style.zIndex=String(3+order.indexOf(id));Object.assign(sheet.style,pose(id));
 sheet.innerHTML=`<img class="sheet-paper" src="${assets+d.asset+'-paper.png'}" alt=""><header class="sheet-identity"><div class="sheet-crest"><img src="${assets+d.asset+'-source.jpg'}" alt="${esc(d.zh)}校徽"></div><h2>${esc(d.name)}</h2><p class="school-zh">${esc(d.zh)}</p></header><button class="sheet-hit" aria-label="拿起${esc(d.zh)}文件"><span>拿起閱讀</span></button><div class="sheet-ui" inert aria-hidden="true"><p class="sheet-subtitle">${esc(d.subtitle)}</p><div class="sheet-copy" tabindex="0" role="region" aria-label="${esc(d.zh)}入學資訊">${bodyMarkup(d.blocks)}</div><div class="sheet-actions"><button class="put-down">放回桌面</button><button class="confirm-enrollment paper-button--ornate">選擇此校</button>${allowed.length>1?'<div class="stack-navigation"><button data-direction="-1" aria-label="閱讀上一份文件">上一份</button><button data-direction="1" aria-label="閱讀下一份文件">下一份</button></div>':''}</div></div>`;
 root.append(sheet);sheets.set(id,sheet);
 const hit=sheet.querySelector('.sheet-hit'),ui=sheet.querySelector('.sheet-ui'),copy=sheet.querySelector('.sheet-copy');copy.scrollTop=desk.scroll[id]||0;
 hit.onclick=()=>pick(id);
 sheet.querySelector('.put-down').onclick=()=>put();
 sheet.querySelector('.confirm-enrollment').onclick=()=>enroll(id);
 for(const b of sheet.querySelectorAll('[data-direction]')){b.prepend(assetIcon(b.dataset.direction==='-1'?'left':'right'));b.onclick=async()=>{if(motion.busy)return;const target=order[(order.indexOf(id)+Number(b.dataset.direction)+order.length)%order.length];await put(false);if(motion.state==='desk')await pick(target);};}
 copy.addEventListener('scroll',()=>{desk.scroll[id]=copy.scrollTop;},{passive:true});
 copy.addEventListener('scrollend',()=>persist());
 }
 decorateButtons(root);for(const b of root.querySelectorAll('.sheet-hit'))b.classList.remove('paper-button');
 async function pick(id){if(motion.busy||motion.state!=='desk')return;active=id;const sheet=sheets.get(id),ui=sheet.querySelector('.sheet-ui');for(const s of sheets.values())s.querySelector('.sheet-hit').disabled=true;sheet.querySelector('.sheet-hit').hidden=true;sheet.style.zIndex='10';
 await motion.pick(sheet,ui,pose(id),pose(id,true));desk.readingSchool=id;persist();ui.querySelector('.sheet-copy').focus({preventScroll:true});}
 async function put(focus=true){if(motion.busy||!active||motion.state!=='reading')return;const id=active,sheet=sheets.get(id);await motion.put(sheet,sheet.querySelector('.sheet-ui'),pose(id));sheet.style.zIndex=String(3+order.indexOf(id));sheet.querySelector('.sheet-hit').hidden=false;for(const s of sheets.values())s.querySelector('.sheet-hit').disabled=false;active=null;desk.readingSchool=null;persist();if(focus)sheet.querySelector('.sheet-hit').focus({preventScroll:true});}
 function enroll(id){if(motion.busy||motion.state!=='reading'||active!==id)return;const dialog=document.createElement('dialog');dialog.className='enrollment-dialog';dialog.innerHTML=`<h2>確認就讀${esc(schoolContent[id].zh)}？</h2><p>提交後，本局將依這份入學文件進入該校的報到流程。</p><div class="actions"><button class="cancel">繼續閱讀</button><button class="accept paper-button--ornate">確認學校</button></div><p role="alert"></p>`;root.append(dialog);decorateButtons(dialog);dialog.querySelector('.cancel').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();dialog.querySelector('.accept').onclick=async()=>{try{state=confirmSchool(state,id,storage);dialog.close();motion.busy=true;motion.set('handoff');const sheet=sheets.get(id);await motion.animate(sheet,[{opacity:'1',transform:sheet.style.transform},{opacity:'0',transform:'translate(-50%,-120%) scale(.8)'}],300);showOpening(root,state);}catch(e){dialog.querySelector('[role=alert]').textContent='保存失敗：'+e.message;}};dialog.showModal();}
 root.onkeydown=e=>{if(e.key==='Escape'&&!root.querySelector('dialog[open]'))put();};
 if(desk.readingSchool)pick(desk.readingSchool);
}
function showOpening(root,state){
 const d=schoolContent[state.selectedSchool];root.dataset.documentState='opening';root.dataset.openingRoute=state.openingFlow.route;
 const lines={coed:['「Ravenwood High School（雷文伍德高中）。」','對方確認了一遍你填寫的學校名稱，拿起筆，在表格右下角留下簽記。','「好。你的入學資料會直接轉交給學校。」','他翻到另一張文件，確認了幾行資料。','「你是國際學生，所以住宿也會一起安排。到了那裡，先去新生住宿報到處，他們會告訴你接下來該去哪裡。」','文件被重新疊好。','「行李記得帶在身邊。今天大概還要跑幾個地方。」'],boys:['「Avenor Boys’ Academy（阿維諾男子學院）。」','對方看了一眼表格，又抬頭確認了一次你的資料。','「好，資料沒有問題。」','他在文件上簽名，隨後從旁邊抽出另一張薄薄的資料頁，夾進你的入學文件。','「Avenor 的住宿安排和其他學校不太一樣。你到了之後，還要決定是住學校宿舍，還是在校外居住。」','「現在不用選。到那裡之後，他們會把兩種方式都告訴你。」','他將文件邊緣對齊，放進資料夾。','「所以，在找到今晚睡哪裡以前，先別把行李弄丟了。」'],girls:['「Rosamund Girls’ Academy（羅莎蒙德女子學院）。」','對方的目光停在學校名稱上。','「……好。」','他沒有立刻把文件收走，而是重新確認了一次你的姓名與入學資料。','接著，一枚印章落在紙面上。','「到了學校以後，不用先去宿舍。」','他把表格收入文件夾。','「直接去大禮堂。」','你大概露出了些疑惑。','對方像是早就看過很多次這種表情。','「放心，你沒有漏掉什麼程序。」','「Rosamund 的新生都是這樣。」']};
 root.innerHTML=`<article class="opening-receipt" tabindex="-1"><h1>${esc(d.zh)}</h1><p>你將填好的表格推回桌子的另一側。</p><p>對方低頭看了一眼，在學校名稱旁停了片刻。</p><p>紙張翻動的聲音在安靜的房間裡格外清楚。</p>${lines[state.selectedSchool].map(p=>'<p>'+esc(p)+'</p>').join('')}<small>入學資料已保存。此版試玩至文件交件；後續報到內容將接續開放。</small></article>`;
 root.querySelector('article').focus();root.dispatchEvent(new CustomEvent('school-opening-ready',{bubbles:true,detail:{playerState:state,route:state.openingFlow.route}}));
}
