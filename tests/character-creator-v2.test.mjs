import test from 'node:test';
import assert from 'node:assert/strict';
import {newCharacter,validateCharacter,validatePage,pageGate,confirmCharacterData} from '../web/creation-v2/creator-service.mjs';
import {allocate,adjust,attributePointsRemaining,randomizeAttributes,randomizeSkills,randomizeProficiencies} from '../web/creation-v2/allocation-engine.mjs';
import {attributeTotal,validateAttributes} from '../web/creation-v2/attribute-engine.mjs';
import {categoryBudget,categoryStatus,proficiencyRemaining} from '../web/creation-v2/point-source-ledger.mjs';
import {attributes,categories,financeTiers,rules} from '../web/creation-v2/catalog.mjs';
import {newRun,readRun,rollFinance,developerFinance} from '../web/creation-v2/finance.mjs';
import {readFile} from 'node:fs/promises';
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}};
function filled(){const s=newCharacter();for(const [id,n] of Object.entries({STR:25,CON:25,AGI:25,DEX:25,PER:25,INT:25}))allocate(s,'attribute',id,n);s.basic={lastName:'測',firstName:'試角色',month:'2',day:'29',gender:'female',pronouns:'they/them'};s.motherTongue='中文';s.nationality='美國';allocate(s,'skill','寫作',1);allocate(s,'proficiency','鋼琴',1);return s}

test('seven creator steps hand off to independently saved school selection',async()=>{
 const s=filled(),run={id:'run-a',locked:true,result:{id:'tier_3',label:'上中產'}};
 assert.equal(confirmCharacterData(s,run),true);assert.deepEqual(validateCharacter(s,run),[]);
 const app=await readFile('web/opening/app.mjs','utf8'),html=await readFile('web/opening/index.html','utf8');
 assert.match(app,/const titles=\['基本資料','家庭經濟','能力值','技能','熟練度','背景','最終確認'\]/);
 assert.doesNotMatch(app,/House Placement|residenceId|preparation_week/);
 assert.match(app,/commitCreator\(s,run\)/);assert.match(app,/confirmCharacterData\(s,run\)/);
 assert.match(html,/paper-master\.jpg|style\.css/);assert.match(html,/rotateGate/);
 assert.match(html,/app\.mjs\?v=cyw51-r10/);assert.match(html,/style\.css\?v=cyw51-r10/);
});

test('150 attribute points, individual cap, exact completion and clamp',()=>{
 assert.equal(rules.attributeTotal,150);const s=filled();assert.equal(attributeTotal(s),150);assert.equal(attributePointsRemaining(s),0);
 allocate(s,'attribute','CON',0);allocate(s,'attribute','AGI',0);allocate(s,'attribute','STR',64);assert.equal(adjust(s,'attribute','STR',5),65);
 assert.throws(()=>allocate(s,'attribute','STR',66),/65/);
 assert.equal(adjust(s,'attribute','STR',-100),0);assert.equal(adjust(s,'attribute','STR',10),10);
 const partial=newCharacter();for(const [id,n] of Object.entries({STR:60,CON:60,AGI:14,DEX:14}))allocate(partial,'attribute',id,n);
 assert.equal(attributeTotal(partial),148);assert.equal(adjust(partial,'attribute','STR',10),62);assert.equal(attributePointsRemaining(partial),0);
 assert.equal(adjust(partial,'attribute','STR',-100),0);assert.equal(adjust(partial,'attribute','STR',100),62);
 assert.throws(()=>allocate(partial,'attribute','CON',65),/150/);
});

test('all 14 skill categories use the formal pair and exact budget formula',()=>{
 const expected={語言:'INT,PER',表達:'INT,PER',數理:'INT,PER',自然科學:'INT,PER','社會與人文':'INT,PER',藝術:'DEX,PER',音樂:'INT,PER',表演:'AGI,CON','資訊與媒體':'INT,DEX','工程／製作':'INT,DEX',生活技能:'DEX,PER',體育:'STR,AGI',人際:'INT,PER','感知／調查':'PER,INT'};
 assert.equal(Object.keys(categories).length,14);
 for(const [id,pair] of Object.entries(expected))assert.equal(categories[id].pair.join(','),pair);
 const s=newCharacter();for(const [id,n] of Object.entries({STR:0,CON:0,AGI:0,DEX:65,PER:65,INT:0}))s.attributes[id]=n;
 assert.equal(categoryBudget(s,'藝術'),172);
 for(const [id,{pair}] of Object.entries(categories)){const [a,b]=pair;assert.equal(categoryBudget(s,id),s.attributes[a]+s.attributes[b]+Math.floor(s.attributes[a]*s.attributes[b]/100))}
});

test('skills share category budgets; mother tongue 55 is free, only excess spends',()=>{
 const s=newCharacter();for(const [id,n] of Object.entries({STR:0,CON:0,AGI:0,DEX:65,PER:65,INT:0}))s.attributes[id]=n;
 assert.equal(categoryStatus(s,'語言').allocated,0);
 allocate(s,'skill','母語',60);assert.equal(categoryStatus(s,'語言').allocated,5);
 allocate(s,'skill','繪畫',65);allocate(s,'skill','設計',65);
 assert.equal(categoryStatus(s,'藝術').allocated,130);assert.equal(categoryStatus(s,'藝術').total,172);
 assert.equal(adjust(s,'skill','繪畫',10),65);assert.throws(()=>allocate(s,'skill','設計',66),/65/);
});

test('attribute changes preserve skills and final confirmation flags overbudget',()=>{
 const s=newCharacter();for(const [id,n] of Object.entries({STR:0,CON:0,AGI:0,DEX:65,PER:65,INT:0}))s.attributes[id]=n;
 allocate(s,'skill','繪畫',65);allocate(s,'skill','設計',65);allocate(s,'skill','攝影',20);
 allocate(s,'attribute','DEX',0);assert.equal(s.skills['繪畫'],65);assert.equal(s.skills['設計'],65);assert(categoryStatus(s,'藝術').remaining<0);
 assert(validateCharacter(s,{locked:true}).some(x=>x.includes('藝術 超額')));
});

test('400 proficiency pool is independent and uses clamp and 75 cap',()=>{
 assert.equal(rules.proficiencyTotal,400);const s=newCharacter();assert.equal(proficiencyRemaining(s),400);
 assert.equal(adjust(s,'proficiency','鋼琴',10),10);assert.equal(adjust(s,'proficiency','鋼琴',100),75);
 assert.throws(()=>allocate(s,'proficiency','鋼琴',76),/75/);assert.equal(proficiencyRemaining(s),325);
 assert.equal(categoryStatus(s,'音樂').allocated,0);
});

test('five finance results have equal 20 percent buckets and persist run-bound',()=>{
 const storageRef=storage();newRun(storageRef,'run-a');
 const outputs=[0,.2,.4,.6,.8].map((n,i)=>{newRun(storageRef,'sample-'+i);return rollFinance(storageRef,()=>n).result.id});
 assert.deepEqual(outputs,['tier_1','tier_2','tier_3','tier_4','tier_5']);
 assert.deepEqual(financeTiers.map(x=>x.id),outputs);
 const stored=readRun(storageRef),reroll=rollFinance(storageRef,()=>.99);
 assert.deepEqual(reroll,stored);assert.equal(readRun(storageRef).result.id,'tier_5');
 newRun(storageRef,'run-b');assert.equal(readRun(storageRef).locked,false);
 assert.throws(()=>rollFinance(storageRef,()=>1),/隨機值/);
 assert.equal(developerFinance(storageRef,{tierId:'tier_2'}).result.id,'tier_2');
});

test('month/day picker creates only valid dates and February excludes day 30',async()=>{
 const source=await readFile('web/opening/app.mjs','utf8'),html=await readFile('web/opening/index.html','utf8');
 assert.match(source,/function openBirthdayPicker/);assert.match(source,/const n=Number\(m\.value\),max=n\?\[31,29,31,30/);
 assert.match(source,/id="openBirthday"/);assert.match(html,/id="birthMonth"/);assert.match(html,/id="birthDay"/);
 const s=filled();s.basic.day='30';assert(validateCharacter(s,{locked:true}).some(e=>e.includes('生日')));
});

test('portrait is only rendered on page 01; final summary omits portrait and all school concepts',async()=>{
 const app=await readFile('web/opening/app.mjs','utf8'),html=await readFile('web/opening/index.html','utf8');
 assert.match(app,/case 0:html=.*portraitSource/);const final=app.slice(app.indexOf('case 6:{'),app.indexOf('page.innerHTML=html'));
 assert.doesNotMatch(final,/portrait|school|House|Residence|校徽|住宿|選校/);
 const css=await readFile('web/opening/style.css','utf8');
 assert.match(css,/background:[^;]*paper-master\.jpg/);assert.match(css,/orientation: portrait/);assert.match(css,/orientation: landscape/);
 assert.match(css,/grid-template-columns: repeat\(7, minmax\(0, 1fr\)\)/);assert.match(css,/note-tab\.active/);assert.match(css,/note-tab\.pressed/);
});

test('skill details, expanded categories and scroll position persist',async()=>{
 const app=await readFile('web/opening/app.mjs','utf8');
 assert.match(app,/data-group/);assert.match(app,/s\.openGroups\[d\.dataset\.group\]=d\.open/);
 assert.match(app,/s\.scroll\[s\.page===3\?'skills':'proficiencies'\]/);
 assert.match(app,/class="note-tab/);assert.match(app,/b\.classList\.add\('pressed'\)/);
 assert.match(app,/input\.oninput=.*allocate\(s,kind,id,Number\(input\.value\)\)/);assert.match(app,/refreshSkillBudget\('語言'\)/);
});

test('original attached paper master is byte-for-byte used by the page asset',async()=>{
 const {readFile,stat}=await import('node:fs/promises'),{createHash}=await import('node:crypto'),b=await readFile('web/opening/paper-master.jpg');
 assert.equal(createHash('md5').update(b).digest('hex'),'f4313003d0a5317582b87c9b9701ae59');assert.equal((await stat('web/opening/paper-master.jpg')).size,246605);
});

test('short landscape uses a bounded paper document, single-line tabs and internal lists',async()=>{
 const css=await readFile('web/opening/style.css','utf8');
 const mobile=css.split('@media (orientation: landscape) and (max-height: 600px) and (max-width: 1100px) {')[1]?.split('@media (orientation: portrait)')[0];
 assert(mobile,'dedicated short landscape rules must exist');
 assert.match(mobile,/\.paper\s*\{[^}]*width: 100%; height: 100dvh;[^}]*overflow: hidden;/s);
 assert.match(mobile,/\.sheet\s*\{[^}]*height: 100%; overflow: hidden;/s);
 assert.match(mobile,/#tabs \.note-tab\s*\{[^}]*white-space: nowrap; word-break: keep-all;/s);
 assert.match(mobile,/#page:has\(\.split\)\s*\{[^}]*overflow: hidden;/s);
 assert.match(mobile,/\.list, \.details\s*\{[^}]*overflow-y: auto; overflow-x: hidden;/s);
 assert.match(mobile,/\.counter\s*\{[^}]*flex-wrap: nowrap;/s);
 assert.match(mobile,/footer\s*\{[^}]*flex: none;/s);
 assert.doesNotMatch(mobile,/150dvh|aspect-ratio: 3 \/ 2/);
});


test('random allocation uses the formal engine and stays within 150 and each category budget',()=>{
 for(let i=0;i<20;i++){
  const s=newCharacter();randomizeAttributes(s,Math.random);assert.equal(attributeTotal(s),150);validateAttributes(s,true);
  randomizeSkills(s,Math.random);for(const id of Object.keys(categories))assert(categoryStatus(s,id).remaining>=0);
  for(const [id,value] of Object.entries(s.skills))assert(value>=0&&value<=65, id);
  allocate(s,'attribute','STR',Math.max(0,s.attributes.STR-1));assert.equal(attributeTotal(s),149);
 }
});
test('five player labels are fixed; missing data and allocations block confirmation',()=>{
 assert.deepEqual(financeTiers.map(x=>x.label),['小康','中產','上中產','富裕','超富裕']);
 const s=filled(),run={id:'a',locked:true,result:financeTiers[0]};assert.deepEqual(validateCharacter(s,run),[]);
 s.basic.firstName='';assert(validateCharacter(s,run).some(x=>x.includes('名字')));s.basic.firstName='名';
 s.proficiencies.鋼琴=0;assert(validateCharacter(s,run).some(x=>x.includes('熟練度')));
});
test('older drafts keep their data while being reduced to the new attribute limit',()=>{
 const s=filled();s.attributes=Object.fromEntries(attributes.map(id=>[id,40]));
 assert.equal(attributeTotal(s),240);
 allocate(s,'attribute','STR',10);assert.equal(attributeTotal(s),210);
 assert.throws(()=>allocate(s,'attribute','STR',11),/150/);
 randomizeAttributes(s,()=>0);assert.equal(attributeTotal(s),150);
 assert.equal(s.basic.lastName,'測');assert.equal(s.proficiencies.鋼琴,1);
});

test('proficiency random allocation spends exactly 400 through caps and permits manual edits',()=>{
 for(const rng of [()=>0,()=>.999999,Math.random]){
  const s=filled();s.customProficiencies.push('測試樂器');
  randomizeProficiencies(s,rng);
  assert.equal(proficiencyRemaining(s),0);
  assert(Object.values(s.proficiencies).every(v=>Number.isInteger(v)&&v>=0&&v<=75));
  const id=Object.keys(s.proficiencies).find(id=>s.proficiencies[id]>0),value=s.proficiencies[id];
  adjust(s,'proficiency',id,-1);assert.equal(proficiencyRemaining(s),1);
  adjust(s,'proficiency',id,10);assert.equal(s.proficiencies[id],value);assert.equal(proficiencyRemaining(s),0);
  const before=structuredClone(s);assert.throws(()=>randomizeProficiencies(s,()=>1),/隨機值/);assert.deepEqual(s,before);
 }
});

test('page gates and confirmation share validation including edits and invalid individual values',()=>{
 const s=filled(),run={locked:true};assert.deepEqual(pageGate(s,run,6),[]);
 for(const [page,mutate] of [
  [0,s=>s.basic.lastName=''],[1,s=>s.nationality=''],[2,s=>s.attributes.STR--],
  [3,s=>s.skills.寫作=-1],[4,s=>s.proficiencies.鋼琴=76]
 ]){const copy=structuredClone(s);mutate(copy);assert(validatePage(copy,run,page).length);assert(pageGate(copy,run,6).length);assert.throws(()=>confirmCharacterData(copy,run));}
 assert.deepEqual(validatePage(s,run,5),[]);
 s.attributes.STR=66;s.attributes.CON=-16;
 assert.equal(attributeTotal(s),150);assert(validatePage(s,run,2).length,'total alone cannot bypass caps');
});

test('overbudget proficiency drafts cannot proceed, lose no data, and can be repaired',()=>{
 const s=filled();s.proficiencies={鋼琴:75,吉他:75,小提琴:75,鼓:75,素描:75,水彩:75};
 assert.equal(proficiencyRemaining(s),-50);assert(validatePage(s,{locked:true},4).length);
 adjust(s,'proficiency','水彩',-10);assert.equal(s.proficiencies.水彩,65);
 randomizeProficiencies(s,()=>0);assert.equal(proficiencyRemaining(s),0);assert.equal(s.basic.lastName,'測');
});
