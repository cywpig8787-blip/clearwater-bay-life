import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {fields,modes,createState,roll,seeded,textFor,lockAll,unlockAll,clearCharacter,restore} from '../web/npc-generator/engine.mjs';
test('requested removals only; basic and full generate',()=>{
 const removed=['posture','access','direction','upkeep','activity','clothingSource','familyRules','sensory','culture','motivation','friction','attitude','styleFamily','formality','tidiness','coordination','dailyWear','climate','depth','socialStart','learning','family','familyDynamic','twist','makeup','items','occasionWear'];
 assert.equal(fields.length,26);for(const id of removed)assert.ok(!fields.some(f=>f.id===id));
 assert.equal(restore({version:2,mode:'6'}).mode,'all');
 const html=fs.readFileSync(new URL('../web/npc-generator/index.html',import.meta.url),'utf8');assert.ok(!/快速 6|標準 10|完整 15|全部細節/.test(html));assert.ok(html.includes('完整版'));assert.ok(html.includes('考古模式'));
 assert.ok(!fs.readFileSync(new URL('../web/npc-generator/app.mjs',import.meta.url),'utf8').includes('隨人物與穿搭自動整理'));
 for(const mode of ['all']){const s=roll({...createState(),mode},{rng:seeded(8)}).state;assert.ok(fields.every(f=>s.values[f.id]?.label));assert.equal(modes.all.length,26);assert.ok(!/姿態／動作|興趣資源取得|人生方向確定度|打理時間|當天活動需求|衣物取得方式|家庭穿衣管束|穿著感官需求|風格接觸來源/.test(textFor(s)));}
});
test('individual lock, lock all, unlock all preserve character; clear then reroll',()=>{
 const rng=seeded(19);let s=roll({...createState(),mode:'all'},{rng}).state;const before=structuredClone(s);
 s=lockAll(s);assert.deepEqual(s.values,before.values);assert.deepEqual(s.history,before.history);assert.equal(s.count,before.count);
 const locked=roll(s,{rng});assert.deepEqual(locked.state,s);assert.deepEqual(locked.changed,[]);
 const restored=restore(JSON.parse(JSON.stringify(s)));assert.deepEqual(roll(restored,{rng}).state.values,restored.values);
 s=unlockAll(s);assert.deepEqual(s.values,before.values);assert.deepEqual(s.locked,{});
 s.locked.core=true;const core=structuredClone(s.values.core);s=roll(s,{rng}).state;assert.deepEqual(s.values.core,core);
 const history=structuredClone(s.history);s=clearCharacter(s);assert.deepEqual(s.values,{});assert.deepEqual(s.locked,{});assert.deepEqual(s.history,history);
 assert.ok(!restore(JSON.parse(JSON.stringify(s))).values.core);s=roll(s,{rng}).state;assert.ok(fields.every(f=>s.values[f.id]));
});

