import test from 'node:test';import assert from 'node:assert/strict';
import {fields,modes,pools,styles,createState,roll,seeded,issues,restore,textFor} from '../web/npc-generator/engine.mjs';
import {emphasisTotal} from '../web/npc-generator/rules.mjs';
const forbidden=/\bcm\b|公分|身體比例|膚色底調|眼距|髮量|不綁|不加配件|undefined|null|？？？|personality|likes|dislikes|interest|makeup|familyDynamic/;
test('twelve active visual fields, whole descriptions and retained style diversity',()=>{
 assert.deepEqual(fields.map(f=>f.id),['height','body','skin','face','eyes','iris','brows','nose','lips','hair','feature','core']);
 assert.deepEqual(modes.all,fields.map(f=>f.id));assert.equal(Object.keys(pools).length,12);
 assert.ok(styles.length>=63);assert.ok(pools.hair.length>3000);assert.ok(pools.eyes.length>=30);assert.ok(pools.iris.length>=20);
 for(const [id,p] of Object.entries(pools)){assert.equal(new Set(p.map(x=>x.label)).size,p.length,id);assert.ok(p.every(x=>x.label&&!forbidden.test(x.label)),id);}
 assert.deepEqual(pools.height.map(x=>x.label),['偏矮','中等','偏高','高挑']);
});
test('10,000 coherent visual seeds: complete, concise, diverse, few markings',()=>{
 const rng=seeded(7711),seen=new Map(fields.map(f=>[f.id,new Set()])),signatures=new Set(),counts=[0,0,0];let s=createState();
 for(let i=0;i<10000;i++){
  s=roll({...s,history:[]},{rng}).state;assert.equal(Object.keys(s.values).length,12);assert.deepEqual(issues(s),[]);assert.ok(emphasisTotal(s.values)<=2);
  const text=textFor(s);assert.ok(!forbidden.test(text));assert.equal(text.split('\n').filter(x=>x.includes('：')).length,12);
  for(const f of fields){assert.ok(s.values[f.id]?.label);seen.get(f.id).add(s.values[f.id].label);assert.ok(s.values[f.id].label.length<=35,f.id);}
  counts[s.values.feature.marks.length]++;signatures.add(text);
 }
 assert.equal(signatures.size,10000);assert.equal(seen.get('core').size,styles.length);assert.ok(seen.get('hair').size>2000);
 assert.equal(seen.get('eyes').size,pools.eyes.length);assert.equal(seen.get('iris').size,pools.iris.length);
 assert.ok(counts[0]>5800&&counts[0]<6600,counts);assert.ok(counts[2]>180&&counts[2]<420,counts);
 console.log('10,000 unique; markings',counts,'hair variants observed',seen.get('hair').size);
});
test('anti-repeat, history cap, transactions, exact reload without pool mutation',()=>{
 const rng=seeded(12);let s=roll(createState(),{rng}).state;const seen=[];
 for(let i=0;i<110;i++){s=roll(s,{only:'iris',rng}).state;assert.ok(!seen.slice(-8).includes(s.values.iris.label));seen.push(s.values.iris.label);}
 assert.equal(s.history.length,100);assert.deepEqual(restore(JSON.parse(JSON.stringify(s))),s);
 const before=JSON.stringify(s);assert.throws(()=>roll(s,{rng:()=>NaN}));assert.throws(()=>roll(s,{only:'eyeSpacing'}));assert.equal(JSON.stringify(s),before);
});
test('v3 migration strips measurements, former parts, metadata and history leaks',()=>{
 const legacy={version:3,count:7,values:{height:{label:'157 cm｜偏矮'},body:{label:'上身厚實、小腿較細'},skin:{label:'淺米色'},face:{label:'圓臉、下顎略收窄'},eyes:{label:'偏圓杏眼'},eyeSize:{label:'偏小'},iris:{label:'藍灰色'},brows:{label:'柔弧眉、眉峰在外側三分之一'},browWeight:{label:'眉毛中等粗細、毛色偏淡'},nose:{label:'中等大小、鼻樑略窄、鼻尖稍尖、鼻翼略窄'},lips:{label:'上唇略薄、下唇適中、唇峰清楚'},hair:{label:'及肩髮、齊切輪廓'},hairTexture:{label:'連續 S 形波浪'},hairColor:{label:'深棕'},feature:{label:'右嘴角旁小痣'},core:styles[0],personality:{label:'SECRET'},proportion:{label:'SECRET'}},locked:{hair:true,eyeSpacing:true},recent:{personality:['SECRET']}};
 legacy.history=[{number:7,values:legacy.values},{number:6,values:{personality:{label:'SECRET'}}},null];
 const s=restore(legacy);assert.equal(s.version,4);assert.equal(s.values.height.label,'偏矮');assert.equal(s.values.eyes.label,'偏小圓杏眼');assert.equal(s.values.iris.label,'藍灰');assert.equal(Object.keys(s.values).length,12);assert.equal(s.history.length,1);assert.equal(s.locked.hair,true);
 assert.ok(!forbidden.test(JSON.stringify(s)));assert.ok(!/SECRET|eyeSpacing|hairColor|browWeight|proportion/.test(JSON.stringify(s)));
 const malicious=structuredClone(s);malicious.values.hair.likes='SECRET';malicious.history[0].values.personality={label:'SECRET'};assert.ok(!JSON.stringify(restore(malicious)).includes('SECRET'));
});
