import test from 'node:test';import assert from 'node:assert/strict';
import {fields,createState,roll,seeded,lockAll,unlockAll,clearCharacter,restore,issues} from '../web/npc-generator/engine.mjs';
test('locks, clear, reload and full reroll preserve the intended state',()=>{
 const rng=seeded(19);let s=roll(createState(),{rng}).state;const original=structuredClone(s);
 s=lockAll(s);assert.deepEqual(roll(s,{rng}).changed,[]);assert.deepEqual(roll(restore(s),{rng}).state,s);
 s=unlockAll(s);assert.deepEqual(s.values,original.values);assert.deepEqual(s.locked,{});
 const history=structuredClone(s.history);s=clearCharacter(s);assert.deepEqual(s.values,{});assert.deepEqual(s.history,history);s=roll(s,{rng}).state;assert.ok(fields.every(f=>s.values[f.id]));
});
test('each primary reroll changes only its own field; random locks always preserved',()=>{
 const rng=seeded(35);
 for(let n=0;n<100;n++){
  let s=roll(createState(),{rng}).state;for(const f of fields)if(rng()<.4)s.locked[f.id]=true;
  for(const only of [null,...fields.map(f=>f.id)]){
   const before=structuredClone(s);s=roll(s,{only,rng}).state;assert.deepEqual(issues(s),[]);
   for(const f of fields)if(before.locked[f.id]||(only&&f.id!==only))assert.deepEqual(s.values[f.id],before.values[f.id],f.id);
  }
 }
});
