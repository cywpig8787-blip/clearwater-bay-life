import test from 'node:test';
import assert from 'node:assert/strict';
import {allocation,validateAllocation,validateCharacter,attributes,academics,groups,bonusSkills,randomizeScores,skillBudget} from '../web/opening/points.mjs';
import {pointPanel} from '../web/opening/point-ui.mjs';
// User screenshot: Academic 200, Other 215, DEX +15, all other bonuses 0.
// The image contains no skill rows. Test BOTH distributions with these same totals.
const screenshotCase=()=>({attr:{STR:37,CON:37,AGI:37,DEX:65,PER:37,INT:37},academic:{語文:75,數學:75,物理:50},skills:{音樂:75,烹飪:75,設計:50,妙手:15}});
test('screenshot regression: identical 215 totals can be legal or illegal',()=>{
  const legal=screenshotCase(),illegal=screenshotCase();delete illegal.skills.妙手;illegal.skills.演說=15;
  for(const c of [legal,illegal]){assert.equal(skillBudget(c,'skills').total,215);assert.equal(skillBudget(c,'skills').requested,215);}
  assert.equal(skillBudget(legal,'skills').allocated,215);assert.equal(skillBudget(legal,'skills').remaining,0);
  assert.equal(skillBudget(illegal,'skills').allocated,200);assert.equal(skillBudget(illegal,'skills').unfunded,15);assert.equal(skillBudget(illegal,'skills').remaining,15);
  const ledger=allocation(legal);const proof=validateAllocation(legal,ledger.skills);
  assert.equal(proof.valid,true);assert.equal(proof.spent.general,200);assert.equal(proof.spent.DEX,15);
  const dex=ledger.skills.find(s=>s.name==='妙手');assert.equal(dex.baseContribution,0);assert.equal(dex.attributeBonusContributions.DEX,15);
  assert.equal(validateAllocation(illegal,allocation(illegal).skills).valid,false);assert.ok(validateCharacter(illegal).length);
  assert.ok(pointPanel(legal).includes('來源驗證通過'));assert.ok(pointPanel(legal).includes('實際流向：妙手 15'));
  assert.ok(pointPanel(illegal).includes('來源驗證失敗：總額相符不代表合法'));
});
test('independent validator rejects forged contributions without rerouting them',()=>{
  const c=screenshotCase();const base=allocation(c).skills;
  const wrongTarget=structuredClone(base),music=wrongTarget.find(s=>s.name==='音樂'),dex=wrongTarget.find(s=>s.name==='妙手');
  music.baseContribution-=15;music.attributeBonusContributions.DEX=15;dex.baseContribution=15;dex.attributeBonusContributions.DEX=0;
  assert.ok(validateAllocation(c,wrongTarget).errors.some(e=>e.includes('DEX 不可支付 音樂')));
  const overBase=structuredClone(base);overBase.find(s=>s.name==='妙手').baseContribution=15;overBase.find(s=>s.name==='妙手').attributeBonusContributions.DEX=0;
  assert.ok(validateAllocation(c,overBase).errors.some(e=>e.includes('general 投入 215 超過額度 200')));
  const overBonus=structuredClone(base);c.skills.妙手=16;overBonus.find(s=>s.name==='妙手').attributeBonusContributions.DEX=16;
  assert.ok(validateAllocation(c,overBonus).errors.some(e=>e.includes('DEX 投入 16 超過額度 15')));
});
test('every attribute rejects an ineligible destination in an explicit payment ledger',()=>{
  for(const id of attributes){const c=screenshotCase();c.attr=Object.fromEntries(attributes.map(a=>[a,a===id?65:37]));c.academic={};const name=Object.values(groups).flat().find(n=>!bonusSkills[id].includes(n));c.skills={[name]:15};
    assert.equal(validateAllocation(c,[{name,kind:'skills',baseContribution:0,attributeBonusContributions:{[id]:15}}]).valid,false);
  }
});
test('restricted random roll: 100 seeds in each order pay each skill from eligible sources',()=>{
  for(const order of [['academic','skills'],['skills','academic']])for(let seed=1;seed<=100;seed++){
    const c=screenshotCase();c.academic={};c.skills={};let state=seed;const rng=()=>((state=(state*1664525+1013904223)>>>0)/2**32);
    for(const kind of order){const other=kind==='academic'?'skills':'academic',before=JSON.stringify(c[other]);randomizeScores(c,kind,kind==='academic'?academics:Object.values(groups).flat(),rng);assert.equal(JSON.stringify(c[other]),before);}
    const ledger=allocation(c),proof=validateAllocation(c,ledger.skills);assert.equal(proof.valid,true);assert.equal(proof.spent.general,200);assert.equal(proof.spent.DEX,15);
    for(const skill of ledger.skills){assert.ok(skill.allocated<=75);assert.equal(skill.baseContribution+Object.values(skill.attributeBonusContributions).reduce((n,v)=>n+v,0),skill.allocated);if(skill.attributeBonusContributions.DEX)assert.ok(bonusSkills.DEX.includes(skill.name));}
  }
});
