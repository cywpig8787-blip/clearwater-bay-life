import test from 'node:test';
import assert from 'node:assert/strict';
import {newCharacter} from '../web/creation-v2/character-data.mjs';
import {randomizeAttributes,randomizeSkills,randomizeProficiencies} from '../web/creation-v2/allocation-engine.mjs';
import {schoolEligibility,eligibleSchools} from '../web/creation-v2/school-eligibility.mjs';
import {commitCreator,loadPlayerState,saveSchoolDesk,confirmSchool,exportPlayerState,importPlayerState,PLAYER_KEY} from '../web/creation-v2/player-state.mjs';
import {DocumentMotion} from '../web/school-selection/document-motion.mjs';
const store=()=>{const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)}};
function fixture(gender='female',tier=3){const c=newCharacter();c.basic={lastName:'測',firstName:'試',month:2,day:29,gender,pronouns:'我'};c.nationality='臺灣';c.motherTongue='中文';randomizeAttributes(c,()=>.5);randomizeSkills(c,()=>.5);randomizeProficiencies(c,()=>.5);return {c,run:{id:'test-run',locked:true,result:{id:'tier_'+tier}}};}
for(const gender of ['male','female'])for(let tier=1;tier<=5;tier++)test(`${gender} tier ${tier} creates exactly the eligible school set`,()=>{const {c,run}=fixture(gender,tier);assert.deepEqual(eligibleSchools(c,run),gender==='male'&&tier>=2?['coed','boys']:gender==='female'&&tier>=3?['coed','girls']:['coed']);});
test('neutral, body traits, unapproved sponsorship and unlocked finance cannot bypass eligibility',()=>{const {c,run}=fixture('neutral',5);c.bodyTraits={chest:'flat'};assert.deepEqual(eligibleSchools(c,run),[]);c.basic.gender='male';run.locked=false;assert.deepEqual(eligibleSchools(c,run),[]);run.locked=true;run.result.id='tier_1';c.sponsorship=true;assert.equal(schoolEligibility(c,'boys',run).ok,false);});
test('commit snapshot, reading, return, save/load and enrollment remain separate',()=>{const storage=store(),{c,run}=fixture();assert.equal(loadPlayerState(storage),null);let p=commitCreator(c,run,storage);assert.equal(p.phase,'school-selection');c.basic.firstName='modified draft';assert.equal(p.creatorResult.basic.firstName,'試');const before=JSON.stringify(p.creatorResult);p=saveSchoolDesk(p,{order:['girls','coed'],readingSchool:'girls',scroll:{girls:220}},storage);p=loadPlayerState(storage);assert.equal(p.selectedSchool,null);assert.equal(p.schoolDesk.readingSchool,'girls');assert.equal(p.schoolDesk.scroll.girls,220);assert.equal(JSON.stringify(p.creatorResult),before);const other=store();const restored=importPlayerState(exportPlayerState(p),other);assert.deepEqual(restored,p);p=confirmSchool(p,'girls',storage);assert.equal(p.phase,'school-confirmed');assert.equal(p.openingFlow.route,'rosamund-grand-hall-arrival');assert.deepEqual(loadPlayerState(storage),p);assert.equal(JSON.stringify(p.creatorResult),before);assert.equal(p.residenceId,undefined);assert.equal(p.housePlacement,undefined);assert.throws(()=>confirmSchool(p,'coed',storage));});
test('bad data and storage failure never commit or mutate original state',()=>{const {c,run}=fixture();const bad=store();c.basic.lastName='';assert.throws(()=>commitCreator(c,run,bad));assert.equal(bad.getItem(PLAYER_KEY),null);c.basic.lastName='測';const broken={getItem:()=>null,setItem:()=>{throw Error('quota')}};assert.throws(()=>commitCreator(c,run,broken),/quota/);assert.equal(c.confirmed,false);const s=store(),p=commitCreator(c,run,s);const saved=s.getItem(PLAYER_KEY);assert.throws(()=>confirmSchool(p,'boys',s));assert.equal(s.getItem(PLAYER_KEY),saved);assert.throws(()=>saveSchoolDesk(p,{order:['coed','boys'],readingSchool:null},s));});
test('draft promotion replaces its slot without duplicating portrait or losing finance',()=>{const s=store(),{c,run}=fixture();c.appearance.portraitSource={dataUrl:'data:image/png;base64,portrait-fixture'};s.setItem(PLAYER_KEY,JSON.stringify(c));assert.equal(loadPlayerState(s),null);const p=commitCreator(c,run,s);assert.equal(s.getItem(PLAYER_KEY).split('portrait-fixture').length-1,1);assert.deepEqual(p.run,run);assert.equal(loadPlayerState(s).phase,'school-selection');});
test('a stale reading tab cannot overwrite an already confirmed school',()=>{const s=store(),{c,run}=fixture(),p=commitCreator(c,run,s);confirmSchool(p,'girls',s);const saved=saveSchoolDesk(p,p.schoolDesk,s);assert.equal(saved.phase,'school-confirmed');assert.equal(loadPlayerState(s).selectedSchool,'girls');});
for(const [id,gender] of [['coed','female'],['girls','female'],['boys','male']])test(`${id} confirmation survives reload and failed write preserves pending state`,()=>{const s=store(),{c,run}=fixture(gender,3),p=commitCreator(c,run,s);const broken={getItem:s.getItem,setItem(){throw Error('quota')}};assert.throws(()=>confirmSchool(p,id,broken),/quota/);assert.equal(loadPlayerState(s).selectedSchool,null);const next=confirmSchool(p,id,s);assert.equal(loadPlayerState(s).selectedSchool,id);assert.deepEqual(loadPlayerState(s).openingFlow,next.openingFlow);assert.deepEqual(loadPlayerState(s).creatorResult,p.creatorResult);});

for(const reduced of [false,true])test('360ms masked transitions settle at black and keep input gated; reduced='+reduced,async()=>{
 const states=[],durations=[],viewChanges=[],measurements=[];
 const fake=()=>({style:{opacity:'0'},inert:true,animate:(frames,o)=>{durations.push(o.duration);return {finished:Promise.resolve(),cancel(){}}}});
 const sheet=fake(),ui=fake(),curtain=fake(),desk={transform:'translate(0)',filter:'none'},reading={transform:'translate(1px)',filter:'none'};
 const m=new DocumentMotion({reduced:()=>reduced,onMeasure:v=>measurements.push(v),onState:state=>{
  states.push(state);
  if(['darkening','black','revealing'].includes(state))assert.equal(ui.inert,true);
  if(state==='revealing'&&viewChanges.at(-1)==='reading'){assert.equal(sheet.style.transform,reading.transform);assert.equal(ui.style.opacity,'1');assert.equal(curtain.style.opacity,'1');}
 }});
 const change=view=>{assert.equal(curtain.style.opacity,'1');assert.equal(ui.inert,true);viewChanges.push(view);};
 const picking=m.pick(sheet,ui,desk,reading,curtain,change);
 assert.equal(await m.pick(sheet,ui,desk,reading,curtain,change),false);
 assert.equal(await m.put(sheet,ui,desk,curtain,change),false);
 await picking;assert.equal(ui.inert,false);assert.equal(ui.style.opacity,'1');
 const putting=m.put(sheet,ui,desk,curtain,change);assert.equal(await m.put(sheet,ui,desk,curtain,change),false);await putting;
 assert.deepEqual(states,['darkening','black','revealing','reading','darkening','black','revealing','desk']);
 assert.deepEqual(viewChanges,['reading','desk']);assert.equal(ui.inert,true);assert.equal(sheet.style.transform,desk.transform);assert.equal(curtain.style.opacity,'0');
 assert.deepEqual(durations,reduced?[1,1,1,1,1,1]:[160,160,200,120,160,200]);
 assert.equal(measurements.length,2);assert(measurements.every(v=>v.targetMs===360));
});
import {documentPose,loadSchoolFont,schoolFonts,schoolLatinFonts} from '../web/school-selection/presentation.mjs';
for(const count of [1,2,3])test(`authored ${count}-paper layout preserves distinct desk poses`,()=>{
 const poses=Array.from({length:count},(_,index)=>documentPose(index,count));
 assert.equal(new Set(poses.map(p=>p.transform)).size,count);
 for(let i=0;i<count;i++){assert.deepEqual(documentPose(i,count),poses[i]);assert.notEqual(documentPose(i,count,true).transform,poses[i].transform);}
 assert.throws(()=>documentPose(count,count));
});
test('required school fonts reject missing, failed and unchecked faces instead of silent fallback',async()=>{
 for(const [id,family] of Object.entries(schoolFonts)){
  const requested=[];const loaded={load:async query=>{requested.push(query);return [{status:'loaded'}];},check:()=>true};
  assert.equal(await loadSchoolFont(id,loaded),family);assert.deepEqual(requested,[family,...schoolLatinFonts[id]].map(name=>`400 18px "${name}"`));
  await assert.rejects(loadSchoolFont(id,{load:async()=>[],check:()=>true}),/未能載入/);
  await assert.rejects(loadSchoolFont(id,{load:async()=>[{status:'error'}],check:()=>true}),/未能載入/);
  await assert.rejects(loadSchoolFont(id,{...loaded,check:()=>false}),/未能載入/);
  await assert.rejects(loadSchoolFont(id,{load:async()=>{throw Error('network');}}),/network/);
 }
});

test('family relationships survive commit independently of finance and eligibility',()=>{
 const s=store(),{c,run}=fixture();c.familyMembers=[{name:'測試',relationship:'監護人',age:'40',location:'',state:'良好'}];
 const before=structuredClone(run),p=commitCreator(c,run,s);
 assert.deepEqual(loadPlayerState(s).creatorResult.familyMembers,c.familyMembers);
 assert.deepEqual(run,before);assert.deepEqual(p.run,before);
});
