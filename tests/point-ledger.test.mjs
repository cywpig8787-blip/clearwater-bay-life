import test from 'node:test';
import assert from 'node:assert/strict';
import {attributes,academics,groups,bonusSkills,allocation,creatorPlayer,setScore,validateCharacter,skillBudget} from '../web/opening/points.mjs';
import {pointPanel} from '../web/opening/point-ui.mjs';
const fresh=()=>({basic:{gender:'neutral'},attr:{STR:25,CON:25,AGI:25,DEX:65,PER:45,INT:65},academic:{語文:75,數學:75,物理:50},skills:{音樂:75,烹飪:75,設計:50},dev:false});
test('every attribute at 65 funds exactly 15 only in its allowed skills',()=>{
  for(const id of attributes)for(const kind of ['academic','skills'])for(const name of kind==='academic'?academics:Object.values(groups).flat()){
    const c=fresh();c.attr=Object.fromEntries(attributes.map(key=>[key,key===id?65:37]));
    // Start with empty base reservations, then saturate both pools using 75-capped demands.
    c.academic={};c.skills={};
    const pools=allocation(c).pools.filter(p=>p.id===id);
    c[kind]={[name]:15};const result=allocation(c,{pools});
    assert.equal(result.used,bonusSkills[id].includes(name)?15:0,`${id} -> ${name}`);
    assert.equal(result.pools[0].amount,15);
  }
});
test('per-skill source ledger conserves each point and survives save serialization',()=>{
  const c=fresh();c.academic.化學=10;c.skills.工程=15;c.skills.程式設計=5;
  const result=allocation(c);assert.equal(result.unfunded,0);assert.equal(result.used,430);
  for(const skill of result.skills){
    assert.equal(skill.sources.reduce((n,s)=>n+s.points,0)+skill.unfunded,skill.allocated);
    for(const source of skill.sources){const pool=result.pools.find(p=>p.id===source.poolId);assert.ok(pool.skills.includes(skill.name));}
  }
  for(const pool of result.pools){
    assert.equal(result.skills.flatMap(s=>s.sources).filter(s=>s.poolId===pool.id).reduce((n,s)=>n+s.points,0),pool.used);
    assert.equal(pool.type,attributes.includes(pool.id)?'attributeBonus':'base');
    assert.equal(pool.attribute,attributes.includes(pool.id)?pool.id:null);
  }
  const player=JSON.parse(JSON.stringify(creatorPlayer(c)));assert.deepEqual(player.creationPoints.skills,result.skills);
  player.creationPoints.sources.find(p=>p.id==='DEX').amount=999;
  player.attr.DEX=50;
  assert.equal(creatorPlayer(player).creationPoints.sources.find(p=>p.id==='DEX').amount,0);
  assert.ok(validateCharacter(player).length);
});
test('override lifts caps but rejects unfunded or ineligible skill points and old invalid drafts',()=>{
  const c=fresh();c.dev=true;setScore(c,'attr','DEX',100);setScore(c,'skills','音樂',0);setScore(c,'skills','工程',125);
  assert.deepEqual(validateCharacter(c),[]);assert.throws(()=>setScore(c,'skills','音樂',1));
  c.skills.音樂=1;assert.ok(validateCharacter(c).some(e=>e.includes('適用點數池')));
  setScore(c,'skills','音樂',0);assert.deepEqual(validateCharacter(c),[]);
});
test('manual first edit initializes missing skill collections',()=>{
  const c=fresh();delete c.skills;setScore(c,'skills','工程',15);assert.equal(c.skills.工程,15);
});
test('visible source rows expose independent sources once and exact contributions',()=>{
  const c=fresh();c.academic.化學=15;c.skills.工程=15;
  const html=pointPanel(c),ledger=allocation(c);
  assert.ok(!html.includes('另一池使用'));assert.ok(!html.includes('本池可用'));
  for(const source of ledger.sources){
    assert.equal(html.split('data-source="'+source.id+'"').length-1,1);
    assert.ok(html.includes('可投入：'+source.eligibleSkills.join('、')));
    assert.ok(html.includes('已用 '+source.used+' ／剩餘 '+source.remaining));
  }
  assert.ok(html.includes('化學 15 = INT Bonus 15'));assert.ok(html.includes('工程 15 = DEX Bonus 15'));
});
