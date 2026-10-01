import test from 'node:test';
import assert from 'node:assert/strict';
import {fields,modes,pools,styles,createState,roll,seeded,issues,restore,textFor} from '../web/npc-generator/engine.mjs';
import {emphasisTotal,compatible} from '../web/npc-generator/rules.mjs';
import {styleOptions} from '../web/npc-generator/fashion.mjs';
const forbidden=/personality|likes|dislikes|interest|familyDynamic|resource|makeup|nationality|school|house|intimacy|motivation|unlikedTalent|likedNovice/;
test('only visual catalogs, unique labels, explicit wardrobe options',()=>{
 assert.equal(new Set(fields.map(f=>f.id)).size,fields.length);
 assert.equal(fields.length,30);assert.deepEqual(Object.keys(modes),['all']);
 assert.ok(!forbidden.test(JSON.stringify(pools)));
 for(const [id,p] of Object.entries(pools))assert.equal(new Set(p.map(x=>x.label)).size,p.length,id);
 assert.ok(pools.face.length>=20);assert.ok(pools.hair.length>=35);assert.ok(pools.hairColor.length>=45);
 assert.ok(styles.length>=39);
 for(const s of styles)for(const id of ['silhouette','palette','shoes','accessory'])assert.ok(styleOptions(s,id).length>=3);
});
test('10,000 full rolls: compatibility, budgets, coverage, variation and no forbidden outputs',()=>{
 const rng=seeded(847122);let s=createState();const seen=new Map(fields.map(f=>[f.id,new Set()]));const signatures=new Set();const marks=[0,0,0];let dyed=0;
 for(let i=0;i<10000;i++){
  s=roll({...s,history:[]},{rng}).state;
  assert.deepEqual(issues(s),[]);assert.ok(emphasisTotal(s.values)<=2);
  assert.equal(Object.keys(s.values).length,fields.length);
  for(const {id} of fields){assert.ok(s.values[id]?.label);assert.ok(compatible(id,s.values[id],s.values));seen.get(id).add(s.values[id].label);}
  assert.ok(!forbidden.test(JSON.stringify(s.values)));
  assert.ok(!/undefined|null|神秘|故事|氣質|性格|家境|妝容/.test(textFor(s)));
  const v=s.values;assert.ok((v.eyeSize.salience||0)+(v.eyeTilt.salience||0)<=1);
  marks[v.feature.marks.length]++;if(v.hairColor.kind==='dyed')dyed++;
  assert.ok(v.accessory.count<=1);
  signatures.add(fields.filter(f=>f.group!=='穿搭').map(f=>v[f.id].label).join('/'));
 }
 assert.equal(signatures.size,10000);
 assert.equal(seen.get('core').size,styles.length);
 assert.equal(seen.get('hair').size,pools.hair.length);
 assert.equal(seen.get('hairColor').size,pools.hairColor.length);
 assert.ok(marks[0]>4600&&marks[0]<5400,marks);assert.ok(marks[2]>700&&marks[2]<1300,marks);
 assert.ok(dyed>2100&&dyed<2900,dyed);
 console.log('quality sample: 10,000 unique; mark distribution',marks,'dyed',dyed,'styles',seen.get('core').size);
});
test('anti-repeat where compatible alternatives exist, capped history, transactional failure',()=>{
 const rng=seeded(17);let s=roll(createState(),{rng}).state;const seen=[];
 for(let i=0;i<120;i++){s=roll(s,{only:'iris',rng}).state;assert.ok(!seen.slice(-8).includes(s.values.iris.label));seen.push(s.values.iris.label);}
 assert.equal(s.history.length,100);
 const before=JSON.stringify(s);assert.throws(()=>roll(s,{rng:()=>NaN}));assert.throws(()=>roll(s,{only:'personality',rng}));assert.equal(JSON.stringify(s),before);
});
test('saved character restores exactly without retaining untrusted metadata or growing pools',()=>{
 const counts=Object.fromEntries(Object.entries(pools).map(([k,a])=>[k,a.length]));const rng=seeded(118);let s=createState();
 for(let i=0;i<200;i++){
  s=roll({...s,history:[]},{rng}).state;s.locked.hair=true;
  assert.deepEqual(restore(JSON.parse(JSON.stringify(s))),s);delete s.locked.hair;
 }
 for(const [id,n] of Object.entries(counts))assert.equal(pools[id].length,n);
});
test('legacy and hostile history, values, locks and recent are whitelisted',()=>{
 const s=roll(createState(),{rng:seeded(8)}).state;
 const dirty={...s,version:2,values:{...s.values,personality:{label:'SECRET'},likes:{label:'SECRET'},hair:{...s.values.hair,personality:'SECRET'}},locked:{personality:true},recent:{personality:['SECRET'],iris:['SECRET']},history:[null,{number:1,values:{...s.values,resource:{label:'SECRET'}}},{number:2,values:{face:{label:'<script>SECRET</script>'}}}]};
 const r=restore(dirty);assert.equal(r.version,3);assert.equal(r.history.length,1);assert.ok(!/SECRET|<script>|personality|resource/.test(JSON.stringify(r)));assert.deepEqual(r.values,s.values);
 assert.equal(restore({version:0}).count,0);
});
