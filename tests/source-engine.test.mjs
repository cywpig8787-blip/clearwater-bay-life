import test from 'node:test';
import assert from 'node:assert/strict';
import {AllocationEngine,pointSources,attributes,academics,groups,bonusSkills,allocation,randomizeScores,setScore,skillBudget,validateCharacter,validateAllocation,creatorPlayer,sum} from '../web/opening/points.mjs';
import {pointPanel} from '../web/opening/point-ui.mjs';
const names={academic:academics,skills:Object.values(groups).flat()};
const fresh=()=>({basic:{gender:'neutral'},attr:{STR:35,CON:35,AGI:35,DEX:35,PER:55,INT:55},academic:{},skills:{},dev:false});
const rng=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
function audit(c){
  const ledger=allocation(c);assert.equal(ledger.unfunded,0);assert.ok(validateAllocation(c,ledger.skills).valid);
  assert.equal(new Set(ledger.sources.map(s=>s.id)).size,8);
  assert.equal(sum(c.academic)+sum(c.skills),ledger.used);
  for(const source of ledger.sources){assert.ok(source.remaining>=0);assert.equal(source.amount,source.used+source.remaining);assert.equal(source.used,source.allocations.reduce((n,a)=>n+a.points,0));}
  for(const skill of ledger.skills){assert.equal(skill.allocated,skill.sources.reduce((n,p)=>n+p.points,0));assert.ok(skill.allocated<=(c.dev?Number.MAX_SAFE_INTEGER:75));for(const p of skill.sources)assert.ok(ledger.sources.find(s=>s.id===p.poolId).eligibleSkills.includes(skill.name));}
  for(const kind of ['academic','skills']){const b=skillBudget(c,kind);assert.ok(b.remaining>=0);assert.equal(b.allocated,sum(c[kind]));assert.equal(b.total,b.allocated+b.remaining);}
}
test('Academic 200 plus INT/PER 5 each leaves exactly 210 for Other, never 215',()=>{
  for(let seed=1;seed<=100;seed++){
    const c=fresh();c.academic={語文:75,數學:75,物理:50};
    assert.equal(skillBudget(c,'skills').total,210);
    randomizeScores(c,'skills',names.skills,rng(seed));
    assert.equal(sum(c.academic),200);assert.equal(sum(c.skills),210);audit(c);
    for(const name of names.skills)if(c.skills[name]<=70)assert.throws(()=>setScore(c,'skills',name,c.skills[name]+5));
  }
});
test('all attribute sources are unique; zeros never reduce 200 bases',()=>{
  for(const id of attributes){const c=fresh();c.attr=Object.fromEntries(attributes.map(a=>[a,a===id?65:37]));const sources=pointSources(c);assert.equal(sources.filter(s=>s.id===id).length,1);assert.equal(sources.filter(s=>s.type==='attributeBonus').reduce((n,s)=>n+s.amount,0),15);}
  const c=fresh();c.attr=Object.fromEntries(attributes.map(a=>[a,40]));for(const kind of ['academic','skills']){randomizeScores(c,kind,names[kind],rng(4));assert.equal(sum(c[kind]),200);}audit(c);
});
test('both orders, reloads and rerolls preserve untouched values AND payments',()=>{
  for(const order of [['academic','skills'],['skills','academic']])for(let seed=1;seed<=50;seed++){
    let c=fresh();
    for(const kind of [...order,...order,...order]){
      const other=kind==='academic'?'skills':'academic';
      const before=structuredClone(c[other]);const payments=allocation(c).skills.filter(s=>s.kind===other);
      randomizeScores(c,kind,names[kind],rng(seed));assert.deepEqual(c[other],before);
      assert.deepEqual(allocation(c).skills.filter(s=>s.kind===other),payments);
      audit(c);c=JSON.parse(JSON.stringify(c));assert.deepEqual(c.creationPoints.skills,allocation(c).skills);
    }
    assert.equal(sum(c.academic)+sum(c.skills),410);
  }
});
test('manual +/- and direct target values commit the same ledger as random allocation',()=>{
  const c=fresh();c.attr={STR:35,CON:35,AGI:35,DEX:60,PER:40,INT:45};
  c.skills={音樂:75,烹飪:75,設計:50};
  setScore(c,'skills','機械',10);audit(c);assert.equal(c.creationPoints.skills.find(s=>s.name==='機械').attributeBonusContributions.DEX,10);
  setScore(c,'skills','設計',20);setScore(c,'skills','機械',40);audit(c);
  const mechanical=c.creationPoints.skills.find(s=>s.name==='機械');assert.equal(mechanical.baseContribution,30);assert.equal(mechanical.attributeBonusContributions.DEX,10);
  assert.ok(pointPanel(c).includes('機械 40 = Base Other 30 + DEX Bonus 10'));
  setScore(c,'skills','機械',35);setScore(c,'skills','機械',40);audit(c);
  const before=JSON.stringify(c);assert.throws(()=>setScore(c,'skills','機械',41));assert.equal(JSON.stringify(c),before);
});
test('INT and a future cross-category PER mapping share single capacities',()=>{
  // Exercise a cross-category PER fixture without changing confirmed game data.
  const c=fresh();c.academic={語文:75,數學:75,物理:55};c.skills={音樂:75,烹飪:75,設計:50,攝影:5};
  const sources=pointSources(c).map(s=>s.id==='PER'?{...s,eligibleSkills:[...s.eligibleSkills,'物理']}:s);
  const ledger=new AllocationEngine(c,{sources,restore:false}).ledger();
  assert.equal(ledger.unfunded,0);assert.equal(ledger.used,410);
  for(const id of ['INT','PER'])assert.equal(ledger.sources.find(s=>s.id===id).used,5);
  c.skills.攝影=10;assert.equal(new AllocationEngine(c,{sources,restore:false}).ledger().unfunded,5);
  assert.deepEqual(bonusSkills.PER,['攝影','洞察','急救']);
});
test('source snapshots cannot mint points after tampering or attribute changes',()=>{
  const c=fresh();randomizeScores(c,'skills',names.skills,rng(4));
  c.creationPoints.sources.find(s=>s.id==='INT').amount=999;
  c.creationPoints.skills.find(s=>s.sources.length).sources[0].points+=999;
  audit(c);
  c.attr.INT=50;const ledger=allocation(c);assert.equal(ledger.sources.find(s=>s.id==='INT').amount,0);assert.equal(ledger.unfunded,5);
  assert.ok(validateCharacter(c).length);assert.ok(ledger.sources.every(s=>s.remaining>=0));
  const html=pointPanel(c);assert.ok(html.includes('未支付'));assert.ok(!/data-budget-value="remaining">-/.test(html));
  assert.equal(creatorPlayer(c).creationPoints.version,2);
});
test('failed random transaction leaves original values and contributions unchanged',()=>{
  const c=fresh();randomizeScores(c,'skills',names.skills,rng(3));const before=JSON.stringify(c);
  assert.throws(()=>randomizeScores(c,'skills',names.skills,()=>NaN));assert.equal(JSON.stringify(c),before);
  assert.throws(()=>randomizeScores(c,'skills',['攝影'],rng(2)));assert.equal(JSON.stringify(c),before);
});
test('developer override never issues free points and normal validation rejects elevated values',()=>{
  const c=fresh();c.dev=true;setScore(c,'attr','DEX',100);setScore(c,'skills','機械',250);audit(c);
  assert.ok(validateCharacter(c,{normal:true}).length);assert.throws(()=>setScore(c,'skills','機械',251));
  c.dev=false;assert.throws(()=>setScore(c,'skills','機械',76));
});
