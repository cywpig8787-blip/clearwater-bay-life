import test from 'node:test';
import assert from 'node:assert/strict';
import {academics,groups,skillBudget,randomizeScores,allocation,sum,setScore} from '../archive/character-creation-v1/points.mjs';
import {pointPanel} from '../archive/character-creation-v1/point-ui.mjs';
const names={academic:academics,skills:Object.values(groups).flat()};
const fresh=()=>({attr:{STR:25,CON:25,AGI:50,DEX:60,PER:25,INT:65},academic:{},skills:{},dev:false});
const reload=c=>JSON.parse(JSON.stringify(c));
function random(seed){return ()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);}
function roll(c,kind,seed=51){
  const other=kind==='academic'?'skills':'academic',before=structuredClone(c[other]),budget=skillBudget(c,kind);
  const usedBudget=randomizeScores(c,kind,names[kind],random(seed));
  assert.deepEqual(c[other],before);assert.deepEqual(usedBudget,budget);
  assert.equal(sum(c[kind]),budget.total);assert.ok(Object.values(c[kind]).every(v=>Number.isInteger(v)&&v>=0&&v<=75));
  assert.equal(allocation(c).unfunded,0);
  return c;
}
for(const kind of ['academic','skills'])test(`clean and reloaded: roll ${kind} first without initializing the other pool`,()=>{
  for(const missing of [false,true])for(const refreshed of [false,true]){
    let c=fresh();if(missing)delete c[kind==='academic'?'skills':'academic'];if(refreshed)c=reload(c);
    roll(c,kind);assert.equal(sum(c[kind]),kind==='academic'?215:225);
  }
});
for(const order of [['academic','skills'],['skills','academic']])test(`${order.join(' then ')} preserves the first pool and shared INT budget`,()=>{
  for(let seed=1;seed<=25;seed++){
    let c=roll(fresh(),order[0],seed);c=reload(c);roll(c,order[1],seed+100);
    assert.equal(sum(c.academic)+sum(c.skills),425);
    const sources=allocation(c).pools;assert.equal(sources.find(p=>p.id==='INT').used,15);assert.equal(sources.find(p=>p.id==='DEX').used,10);
  }
});
test('repeated rolls change only the selected pool across reloads',()=>{
  let c=roll(roll(fresh(),'academic'),'skills');
  for(let seed=1;seed<=20;seed++){c=reload(c);roll(c,'academic',seed);roll(c,'skills',seed+20);}
});
test('an invalid other draft cannot freeze or erase this pool, and stays untouched',()=>{
  for(const kind of ['academic','skills']){
    const c=fresh(),other=kind==='academic'?'skills':'academic';
    c[other]=Object.fromEntries(names[other].map(name=>[name,75]));
    const before=structuredClone(c[other]),budget=skillBudget(c,kind);
    randomizeScores(c,kind,names[kind],random(7));
    assert.equal(sum(c[kind]),budget.total);assert.ok(budget.total>=200);assert.deepEqual(c[other],before);
    assert.equal(allocation(c).skills.filter(s=>s.kind===kind).reduce((n,s)=>n+s.unfunded,0),0);
  }
});
test('budgets are computed before sampling; only legal sources are spent, even with override',()=>{
  for(const dev of [false,true]){
    const c=fresh();c.dev=dev;let calls=0;
    const budget=skillBudget(c,'academic');
    randomizeScores(c,'academic',academics,()=>{calls++;assert.deepEqual(c.academic,{});return .5;});
    assert.ok(calls>0);assert.equal(sum(c.academic),budget.total);
    assert.equal(skillBudget(c,'academic').base,200);assert.equal(skillBudget(c,'academic').bonus,15);
    assert.equal(skillBudget(c,'skills').total,210); // DEX 10 remains, INT is already spent.
  }
});
test('UI Base / Bonus / Total / Allocated / Remaining equal actual independent budgets',()=>{
  const c=fresh();
  for(const stage of ['clean','academic','skills','lower-attribute','override']){
    if(stage==='academic'||stage==='skills')roll(c,stage);
    if(stage==='lower-attribute')c.attr.INT=50;
    if(stage==='override'){c.dev=true;c.skills['音樂']=200;}
    const html=pointPanel(c);
    for(const kind of ['academic','skills']){
      const b=skillBudget(c,kind),section=html.match(new RegExp(`data-budget="${kind}"[^>]*>([\\s\\S]*?)</section>`))[1];
      for(const key of ['base','bonus','total','allocated','remaining'])assert.equal(Number(section.match(new RegExp(`data-budget-value="${key}">(-?\\d+)`))[1]),b[key]);
      assert.equal(b.total,b.base+b.bonus);assert.equal(b.remaining,b.total-b.allocated);assert.ok(b.remaining>=0);assert.equal(b.requested,sum(c[kind]));assert.equal(b.unfunded,b.requested-b.allocated);
    }
    assert.ok(html.includes(`INT Bonus = max(0, ${c.attr.INT} - 50) = ${Math.max(0,c.attr.INT-50)}`));
    assert.ok(html.includes('DEX Bonus = max(0, 60 - 50) = 10'));
    assert.ok(html.includes('AGI Bonus = max(0, 50 - 50) = 0'));
  }
});
test('zero bonuses leave independent 200-point pools; manual allocation uses the same budget',()=>{
  const c=fresh();Object.keys(c.attr).forEach(id=>c.attr[id]=40);
  roll(c,'skills');roll(c,'academic');assert.equal(sum(c.skills),200);assert.equal(sum(c.academic),200);
  c.academic={語文:75,數學:75,物理:50};assert.throws(()=>setScore(c,'academic','化學',1));
  c.skills={音樂:75,烹飪:75,設計:50};assert.throws(()=>setScore(c,'skills','攝影',1));
});
