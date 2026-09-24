import test from 'node:test';
import assert from 'node:assert/strict';
import {newCharacter} from '../web/creation-v2/character-data.mjs';
import {AllocationEngine} from '../web/creation-v2/allocation-engine.mjs';
import {sources,ledger,summary} from '../web/creation-v2/point-source-ledger.mjs';
import {attributes,bonusSkills} from '../web/creation-v2/catalog.mjs';
import {creatorPlayer,finishCharacter,loadDraft,validateCharacter} from '../web/creation-v2/creator-service.mjs';
import {schoolEligibility} from '../web/creation-v2/school-eligibility.mjs';
import {pointPanel} from '../web/creation-v2/point-panel.mjs';
const seeded = (seed=7) => () => ((seed=(seed*1664525+1013904223)>>>0)/4294967296);
function proof(s){
 const l=ledger(s);
 for(const source of l.sources)assert.ok(source.remaining>=0);
 for(const kind of ['academic','skills']){
  const b=summary(s,kind);assert.ok(b.allocated<=b.total);assert.equal(b.remaining,b.total-b.allocated);
  for(const [name,value] of Object.entries(s[kind])){
   assert.ok(value<=75);assert.equal(Object.values(s.contributions[kind][name]||{}).reduce((a,b)=>a+b,0),value);
  }
 }
}
test('base budgets stay 200 when every attribute <= 50',()=>{
 const s=newCharacter();assert.deepEqual(sources(s).map(x=>x.amount),[200,200]);proof(s);
});
test('65 produces one restricted 15 source, including cross-category INT',()=>{
 const s=newCharacter();new AllocationEngine(s).set('attr','INT',65);
 assert.deepEqual(sources(s).map(x=>[x.id,x.amount]),[['academic',200],['other',200],['INT',15]]);
 const e=new AllocationEngine(s);e.roll('academic',seeded());e.roll('skills',seeded(99));proof(s);
 assert.equal(ledger(s).sources.find(x=>x.id==='INT').amount,15);
 assert.ok(ledger(s).sources.reduce((n,x)=>n+x.used,0)<=415);
});
for(const first of ['academic','skills'])test(`${first} first; rerolls freeze opposite values and contributions`,()=>{
 const s=newCharacter(),e=new AllocationEngine(s),other=first==='academic'?'skills':'academic';
 e.set('attr','INT',65);e.roll(first,seeded());
 const values=structuredClone(s[first]),payments=structuredClone(s.contributions[first]);
 for(let i=0;i<20;i++){e.roll(other,seeded(i));assert.deepEqual(s[first],values);assert.deepEqual(s.contributions[first],payments);proof(s);}
});
test('manual edits and rejection are atomic; no Available 210 / Allocated 215',()=>{
 const s=newCharacter(),e=new AllocationEngine(s);e.set('attr','INT',60);
 e.set('academic','語文',75);e.set('academic','English',75);e.set('academic','數學',60);
 const before=structuredClone(s);assert.throws(()=>e.set('academic','物理',5));assert.deepEqual(s,before);
 assert.equal(summary(s,'academic').total,210);assert.equal(summary(s,'academic').allocated,210);
 assert.throws(()=>e.set('attr','INT',50));assert.deepEqual(s,before);proof(s);
 e.set('academic','數學',55);e.set('academic','物理',5);proof(s);
});
test('invalid values, limits and invalid RNG never mutate a draft',()=>{
 const s=newCharacter(),e=new AllocationEngine(s),before=structuredClone(s);
 for(const value of [-1,1.5,NaN,Infinity,76])assert.throws(()=>e.set('academic','語文',value));
 assert.throws(()=>e.set('attr','STR',66));assert.throws(()=>e.roll('academic',()=>1));assert.deepEqual(s,before);
});
test('random attributes total 250, cap 65, no positive minimum introduced',()=>{
 const s=newCharacter(),e=new AllocationEngine(s);e.set('attr','STR',0);assert.equal(s.attr.STR,0);
 e.roll('attr',seeded());assert.equal(Object.values(s.attr).reduce((a,b)=>a+b),250);assert.ok(Object.values(s.attr).every(n=>n<=65));proof(s);
});
test('overlapping eligibility never double spends any source in randomized sequences',()=>{
 for(let i=0;i<40;i++){
  const s=newCharacter(),e=new AllocationEngine(s);e.roll('attr',seeded(i));
  for(let j=0;j<4;j++){e.roll(j%2?'academic':'skills',seeded(i*9+j));proof(s);}
 }
});
for(const attr of attributes)test(`${attr} 65 issues exactly one 15-point restricted source`,()=>{
 const s=newCharacter(),e=new AllocationEngine(s);e.set('attr',attr,65);
 const bonus=sources(s).filter(x=>x.id===attr);assert.equal(bonus.length,1);assert.equal(bonus[0].amount,15);
 const skill=bonusSkills[attr][0],kind=attr==='INT'?'academic':'skills';e.set(kind,skill,15);proof(s);
 assert.equal(s.contributions[kind][skill][attr],15);
});
test('manual transactions preserve the opposite category exact payments',()=>{
 const s=newCharacter(),e=new AllocationEngine(s);e.set('attr','INT',65);e.roll('academic',seeded());
 const payments=structuredClone(s.contributions.academic),values=structuredClone(s.academic);
 e.set('skills','電腦',75);e.set('skills','電腦',60);
 assert.deepEqual(s.academic,values);assert.deepEqual(s.contributions.academic,payments);proof(s);
});
test('forged contributions, ineligible funds and malformed scores cannot authorise spending',()=>{
 const s=newCharacter(),e=new AllocationEngine(s);e.set('academic','語文',10);
 const clone=()=>structuredClone(s);
 let t=clone();t.contributions.academic['語文']={other:10};assert.throws(()=>ledger(t));
 t=clone();t.academic['語文']=NaN;assert.throws(()=>ledger(t));
 t=clone();t.contributions.academic['語文']={academic:11};assert.throws(()=>ledger(t));
 t=clone();t.contributions.academic['語文']={unknown:10};assert.throws(()=>ledger(t));
});
test('override is separate, must pay, and normal policy rejects elevated values',()=>{
 const s=newCharacter();s.dev=true;const e=new AllocationEngine(s);
 e.set('attr','INT',100);e.set('academic','語文',100);assert.deepEqual(validateCharacter(s),[]);
 assert.ok(validateCharacter(s,{normal:true}).length);e.set('academic','English',100);
 assert.throws(()=>e.set('academic','數學',51));assert.ok(ledger(s).sources.every(x=>x.remaining>=0));
});
test('reload persists exact contributions and visible budgets derive from same ledger',()=>{
 const s=newCharacter(),e=new AllocationEngine(s);e.set('attr','INT',65);e.roll('academic',seeded());
 const restored=loadDraft(JSON.stringify(s));assert.deepEqual(restored,s);
 const html=pointPanel(restored);for(const kind of ['academic','skills']){
  const segment=html.split(`data-budget="${kind}"`)[1].split('</section>')[0];
  for(const [key,value] of Object.entries(summary(s,kind)))assert.ok(segment.includes(`data-budget-value="${key}">${value}</dd>`));
 }
 const payments=structuredClone(restored.contributions.academic);new AllocationEngine(restored).roll('skills',seeded());assert.deepEqual(restored.contributions.academic,payments);
});
test('body traits drive eligibility independently; private school and house rules retained',()=>{
 const s=newCharacter();assert.ok(schoolEligibility(s,'boys').ok);s.bodyTraits.chest='developed';
 assert.equal(schoolEligibility(s,'boys').ok,false);assert.ok(schoolEligibility(s,'girls').ok);
 assert.equal(s.basic.gender,'中性');s.family.finance='一般';assert.equal(schoolEligibility(s,'girls').ok,false);assert.ok(schoolEligibility(s,'coed').ok);
});
test('export preserves character interfaces, strips residence, and validates school choices',()=>{
 const s=newCharacter();new AllocationEngine(s).roll('attr',seeded());s.basic.name='Test';s.school='coed';
 s.residentialAccess='male_side';s.roomId='stale';const saved=finishCharacter(s),p=saved.player;
 assert.equal(p.basic.gender,'neutral');assert.equal(p.genderIdentity,'neutral');assert.deepEqual(p.bodyTraits,s.bodyTraits);
 assert.ok(!('roomId' in p));assert.ok(!('residentialAccess' in p));assert.deepEqual(p.creationPoints,ledger(s));
 s.school='girls';assert.throws(()=>finishCharacter(s));s.house='Valette 瓦萊特';assert.doesNotThrow(()=>finishCharacter(s));
 s.school='boys';assert.throws(()=>finishCharacter(s));s.residence='campus';assert.doesNotThrow(()=>finishCharacter(s));
});
