import test from 'node:test';import assert from 'node:assert/strict';
import {fields,createState,roll,seeded,lockAll,unlockAll,clearCharacter,restore,issues} from '../web/npc-generator/engine.mjs';
test('individual and full lock, clear, reload and reroll preserve intended values',()=>{
 const rng=seeded(19);let s=roll(createState(),{rng}).state;const before=structuredClone(s);
 s=lockAll(s);assert.deepEqual(s.values,before.values);assert.deepEqual(s.history,before.history);
 assert.deepEqual(roll(s,{rng}).changed,[]);assert.deepEqual(roll(restore(s),{rng}).state,s);
 s=unlockAll(s);assert.deepEqual(s.values,before.values);assert.deepEqual(s.locked,{});
 const history=structuredClone(s.history);s=clearCharacter(s);assert.deepEqual(s.values,{});assert.deepEqual(s.history,history);assert.ok(!restore(s).values.core);
 s=roll(s,{rng}).state;assert.ok(fields.every(f=>s.values[f.id]));
});
test('random lock subsets and every single-field reroll remain valid, never overwrite locks',()=>{
 const rng=seeded(108);
 for(let n=0;n<250;n++){
  let s=roll(createState(),{rng}).state;
  for(const f of fields)if(rng()<.4)s.locked[f.id]=true;
  for(const only of [null,...fields.map(f=>f.id)]){
   const before=structuredClone(s);s=roll(s,{only,rng}).state;assert.deepEqual(issues(s),[]);
   for(const f of fields)if(before.locked[f.id])assert.deepEqual(s.values[f.id],before.values[f.id],f.id);
  }
 }
});
test('style reroll changes only wardrobe; nose reroll changes no other field',()=>{
 const rng=seeded(35);let s=roll(createState(),{rng}).state;let before=structuredClone(s.values);
 s=roll(s,{only:'core',rng}).state;
 for(const f of fields.filter(f=>f.group!=='穿搭'))assert.deepEqual(s.values[f.id],before[f.id]);
 before=structuredClone(s.values);s=roll(s,{only:'nose',rng}).state;
 for(const f of fields.filter(f=>f.id!=='nose'))assert.deepEqual(s.values[f.id],before[f.id]);
});
