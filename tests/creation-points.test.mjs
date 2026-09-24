import test from 'node:test';
import assert from 'node:assert/strict';
import {attributes,academics,groups,bonus,pointPools,allocation,validateCharacter,setScore,randomizeScores,creatorPlayer,residenceFields,sum} from '../archive/character-creation-v1/points.mjs';
const academic200={'語文':75,'數學':75,'物理':50};
const general200={'音樂':75,'烹飪':75,'設計':50};
function character(values=[42,42,42,42,41,41],academic=academic200,skills=general200){return {basic:{gender:'中性'},school:'coed',attr:Object.fromEntries(attributes.map((id,i)=>[id,values[i]])),academic:{...academic},skills:{...skills},dev:false};}
const archetypes=[
  ['平均型',[42,42,42,42,41,41],academic200,general200,0],
  ['學術型',[37,37,37,37,37,65],{...academic200,'化學':15},general200,15],
  ['運動型',[65,65,60,20,20,20],academic200,{'拳擊':75,'跑步':75,'游泳':75,'籃球':15},40],
  ['藝術型',[25,25,45,65,65,25],academic200,{'音樂':75,'繪畫':75,'攝影':75,'舞蹈':5},30],
  ['技術型',[25,25,25,65,45,65],academic200,{'工程':75,'電腦':75,'程式設計':75,'妙手':5},30],
  ['極端偏科型',[65,65,65,55,0,0],academic200,{'拳擊':75,'跑步':75,'游泳':75,'木工':25},50]
];
for(const [name,values,academic,skills,expectedBonus] of archetypes)test(`${name}: 250 attributes, capped skills, all allocated points funded once`,()=>{
  const c=character(values,academic,skills),result=allocation(c);
  assert.equal(sum(c.attr),250);assert.deepEqual(validateCharacter(c,{complete:true}),[]);
  assert.equal(result.unfunded,0);assert.equal(result.used,400+expectedBonus);
  assert.equal(pointPools(c).slice(2).reduce((n,p)=>n+p.amount,0),expectedBonus);
  for(const pool of result.pools){assert.ok(pool.used<=pool.amount);assert.equal(pool.allocations.reduce((n,a)=>n+a.points,0),pool.used);assert.ok(pool.allocations.every(a=>pool.skills.includes(a.name)));}
});
test('0 through 50 never reduce either fixed base; 55/60/65 give 5/10/15',()=>{
  for(let value=0;value<=50;value++){
    const c=character(Array(6).fill(value));assert.deepEqual(pointPools(c).map(p=>p.amount),[200,200,0,0,0,0,0,0]);assert.equal(allocation(c).unfunded,0);
  }
  assert.deepEqual([40,50,55,60,65].map(bonus),[0,0,5,10,15]);
});
test('DEX technical and creative allocations share one 15-point source',()=>{
  const c=character([37,37,37,65,37,37],academic200,{'音樂':75,'烹飪':75,'設計':50,'工程':10,'繪畫':5});
  assert.equal(allocation(c).unfunded,0);assert.equal(allocation(c).pools.find(p=>p.id==='DEX').used,15);
  assert.throws(()=>setScore(c,'skills','繪畫',6));
  c.skills['繪畫']=15;assert.equal(allocation(c).unfunded,10);
});
test('INT is shared across academic and technical; residual allocation can reroute general points',()=>{
  const c=character([37,37,37,37,37,65],{...academic200,'化學':10},{'電腦':75,'音樂':75,'烹飪':55});
  assert.equal(allocation(c).unfunded,0);assert.equal(allocation(c).pools.find(p=>p.id==='INT').used,15);
  c.skills['烹飪']=56;assert.equal(allocation(c).unfunded,1);
  c.academic['化學']=15;assert.equal(allocation(c).unfunded,6);
});
test('ineligible bonuses and academic base cannot fund general skills',()=>{
  const c=character([65,37,37,37,37,37],{}, {'音樂':75,'烹飪':75,'設計':51});
  assert.equal(allocation(c).unfunded,1);
  c.skills={};c.academic={...academic200,'化學':1};assert.equal(allocation(c).unfunded,1);
});
test('normal edits enforce total 250, attribute 65, skill 75 and integer bounds',()=>{
  const c=character();
  assert.throws(()=>setScore(c,'attr','STR',66));assert.throws(()=>setScore(c,'attr','STR',43));
  assert.throws(()=>setScore(c,'skills','音樂',76));
  for(const v of [-1,NaN,Infinity,0.5])assert.throws(()=>setScore(c,'attr','STR',v));
  setScore(c,'attr','STR',41);assert.ok(validateCharacter(c,{complete:true}).length);assert.deepEqual(validateCharacter(c),[]);
  setScore(c,'attr','PER',42);assert.deepEqual(validateCharacter(c,{complete:true}),[]);
});
test('lowering attributes updates bonus immediately without silently deleting skills',()=>{
  const c=character([37,37,37,65,37,37],academic200,{...general200,'妙手':15});
  setScore(c,'attr','DEX',50);assert.equal(pointPools(c).find(p=>p.id==='DEX').amount,0);
  assert.equal(c.skills['妙手'],15);assert.ok(validateCharacter(c).length);
  setScore(c,'skills','妙手',0);assert.deepEqual(validateCharacter(c),[]);
});
test('override permits extreme testing, but normal validation and edits reject leaked limits',()=>{
  const c=character();c.dev=true;setScore(c,'attr','STR',150);setScore(c,'skills','設計',25);setScore(c,'skills','音樂',100);
  assert.throws(()=>setScore(c,'skills','音樂',300));
  assert.deepEqual(validateCharacter(c,{complete:true}),[]);assert.ok(validateCharacter(c,{normal:true}).length);
  c.dev=false;assert.throws(()=>setScore(c,'attr','CON',66));assert.ok(validateCharacter(c,{complete:true}).length);
  setScore(c,'attr','STR',42);setScore(c,'skills','音樂',75);assert.deepEqual(validateCharacter(c,{complete:true}),[]);
});
test('random rolls stay within budgets and skill caps, including overlapping pools',()=>{
  let seed=51;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
  const c=character(undefined,{},{});
  randomizeScores(c,'attr',attributes,rng);randomizeScores(c,'academic',academics,rng);randomizeScores(c,'skills',Object.values(groups).flat(),rng);
  assert.equal(sum(c.attr),250);assert.deepEqual(validateCharacter(c,{complete:true}),[]);
  assert.equal(allocation(c).unfunded,0);
});
test('creator output canonicalizes gender and removes every actual residence field',()=>{
  for(const [gender,expected] of [['男性','male'],['女性','female'],['中性','neutral']]){
    const c=character();c.basic.gender=gender;residenceFields.forEach(key=>c[key]='stale');
    const out=creatorPlayer(c);assert.equal(out.basic.gender,expected);residenceFields.forEach(key=>assert.ok(!(key in out)));
    assert.equal(c.basic.gender,gender);assert.equal(c.buildingId,'stale');
  }
});
