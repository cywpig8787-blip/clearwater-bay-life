import test from 'node:test';import assert from 'node:assert/strict';
import {fields,modes,pools,styles,createState,roll,seeded,issues,restore,textFor} from '../web/npc-generator/engine.mjs';
import {styleOptions} from '../web/npc-generator/fashion.mjs';
test('catalogs contain visual descriptions and no geometric face lottery',()=>{
 assert.equal(new Set(fields.map(f=>f.id)).size,fields.length);
 assert.ok(!JSON.stringify(pools.face).match(/五官集中|眼距|眉眼距|中庭/));
 assert.ok(styles.length>=80);for(const s of styles){assert.ok(s.silhouette.length>=2);for(const f of ['material','palette','shoes','accessory'])assert.ok(styleOptions(s,f).length);}
 assert.deepEqual(Object.values(modes).slice(0,3).map(a=>a.length),[6,10,15]);
});
test('10,000 full rolls: valid fields, independent talents, access and style consistency',()=>{
 let s=createState();s.mode='all';const rng=seeded(847122);let ordinary=0,bold=0;const seen=new Set();
 for(let i=0;i<10000;i++){
  s=roll({...s,history:[]},{rng}).state;
  for(const f of fields)assert.ok(s.values[f.id]?.label,`${f.id} missing`);
  assert.equal(issues(s).length,0,JSON.stringify(issues(s)));
  const v=s.values;assert.equal(new Set([v.interest.label,v.unlikedTalent.label,v.likedNovice.label]).size,3);
  assert.ok(v.access.levels.includes(v.resource.level));
  if(v.core.family==='everyday')ordinary++;if(v.twist.effect)bold++;seen.add(v.core.id);
  assert.ok(!Object.keys(v).some(k=>/school|house/i.test(k)));
 }
 assert.ok(ordinary>5100&&ordinary<5900,ordinary);assert.ok(bold>900&&bold<1500,bold);assert.equal(seen.size,styles.length);
});
test('locks survive full rolls, mode changes and dependency rerolls',()=>{
 const rng=seeded(39);let s=roll(createState(),{rng}).state;s.locked.silhouette=true;s.locked.personality=true;const before=structuredClone(s.values);
 s=roll(s,{only:'core',rng}).state;assert.deepEqual(s.values.silhouette,before.silhouette);assert.deepEqual(s.values.personality,before.personality);
 s.mode='6';s=roll(s,{rng}).state;assert.deepEqual(s.values.silhouette,before.silhouette);
 assert.deepEqual(roll(s,{only:'silhouette',rng}).changed,[]);
});
test('changing only core never changes personality or family resource',()=>{
 const rng=seeded(108);let s=roll(createState(),{rng}).state;const before=structuredClone(s.values);
 s=roll(s,{only:'core',rng}).state;
 for(const f of ['personality','resource','family','interest','social','gender'])assert.deepEqual(s.values[f],before[f]);
});
test('anti-repeat, compact completeness, capped history and transactional failures',()=>{
 const rng=seeded(17);let s=createState();s.mode='6';s=roll(s,{rng}).state;
 assert.ok(fields.every(f=>s.values[f.id]));
 const seen=[];for(let i=0;i<12;i++){s=roll(s,{only:'personality',rng}).state;assert.ok(!seen.slice(-8).includes(s.values.personality.label));seen.push(s.values.personality.label);}
 for(let i=0;i<105;i++)s=roll(s,{only:'personality',rng}).state;assert.equal(s.history.length,100);
 const before=JSON.stringify(s);assert.throws(()=>roll(s,{rng:()=>NaN}));assert.equal(JSON.stringify(s),before);
});
test('saved character restores choices and locks exactly',()=>{
 const rng=seeded(7);let s=createState();s.mode='all';s=roll(s,{rng}).state;s.locked.core=true;s.locked.hair=true;
 const r=restore(JSON.parse(JSON.stringify(s)));for(const f of fields)assert.equal(r.values[f.id]?.label,s.values[f.id].label,f.id);
 assert.equal(r.locked.core,true);assert.equal(r.history.length,1);assert.ok(textFor(r).includes('口吻／日常反差'));assert.equal(restore({version:0}).count,0);
});
test('repeated reloads preserve bold twists without growing catalog arrays',()=>{
 const counts=Object.fromEntries(Object.entries(pools).map(([k,a])=>[k,a.length]));
 const rng=seeded(118);let s=createState();s.mode='all';
 for(let i=0;i<500;i++){s=roll({...s,history:[]},{rng}).state;const r=restore(JSON.parse(JSON.stringify(s)));for(const f of fields)assert.equal(r.values[f.id]?.label,s.values[f.id].label,f.id);}
 for(const [k,n] of Object.entries(counts))assert.equal(pools[k].length,n,k);
});

