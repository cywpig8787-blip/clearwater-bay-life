import {attributes} from './catalog.mjs';
import {integer,validateAttributes,rollAttributes,sample} from './attribute-engine.mjs';
import {allocationPolicy} from './developer-override.mjs';
import {sources,ledger,namesFor} from './point-source-ledger.mjs';

// Fresh v2 bipartite flow solver. Opposite-category payments are reserved before
// solving; no UI counters or legacy v1 allocator participate in authorisation.
function fund(s,kinds){
 const src=sources(s);const targets=kinds.flatMap(kind=>Object.entries(s[kind]).map(([name,value])=>({kind,name,value})));
 const reserved=Object.fromEntries(src.map(x=>[x.id,0]));
 for(const kind of ['academic','skills'].filter(k=>!kinds.includes(k)))for(const payments of Object.values(s.contributions[kind]))for(const [id,n] of Object.entries(payments)){
  if(!(id in reserved))throw new Error('能力值變更使既有來源失效。');reserved[id]+=n;
 }
 const count=2+src.length+targets.length,sink=count-1,g=Array.from({length:count},()=>[]);
 function edge(a,b,capacity){const forward={to:b,capacity,initial:capacity,reverse:g[b].length};g[a].push(forward);g[b].push({to:a,capacity:0,initial:0,reverse:g[a].length-1});return forward;}
 // Restricted funds first keeps unrestricted bases useful for all other skills.
 const ordered=src.map((x,i)=>({x,i})).sort((a,b)=>Number(['academic','other'].includes(a.x.id))-Number(['academic','other'].includes(b.x.id)));
 for(const {x,i} of ordered){const available=x.amount-reserved[x.id];if(available<0)throw new Error('點數不足。');edge(0,i+1,available);}
 const links=[];let required=0;
 targets.forEach((t,j)=>{integer(t.value);required+=t.value;edge(src.length+1+j,sink,t.value);
  for(const {x,i} of ordered)if(x.eligibleSkills.includes(t.name))links.push({t,id:x.id,e:edge(i+1,src.length+1+j,t.value)});
 });
 let flow=0;
 while(true){
  const path=Array(count).fill(null),queue=[0];path[0]=[-1,-1];
  for(let q=0;q<queue.length&&!path[sink];q++){const a=queue[q];g[a].forEach((e,i)=>{if(e.capacity>0&&!path[e.to]){path[e.to]=[a,i];queue.push(e.to);}});}
  if(!path[sink])break;
  let amount=Infinity;for(let b=sink;b!==0;){const [a,i]=path[b];amount=Math.min(amount,g[a][i].capacity);b=a;}
  for(let b=sink;b!==0;){const [a,i]=path[b],e=g[a][i];e.capacity-=amount;g[b][e.reverse].capacity+=amount;b=a;}flow+=amount;
 }
 if(flow!==required)throw new Error('適用點數不足；原配置已保留，請降低技能或調整能力值。');
 for(const kind of kinds)s.contributions[kind]={};
 for(const {t,id,e} of links){const amount=e.initial-e.capacity;if(amount)(s.contributions[t.kind][t.name]??={})[id]=amount;}
}
export class AllocationEngine{
 constructor(character){this.character=character;}
 transact(change,kinds){
  ledger(this.character);const draft=structuredClone(this.character);change(draft);
  validateAttributes(draft.attr,allocationPolicy(draft));
  for(const kind of ['academic','skills'])for(const [name,value] of Object.entries(draft[kind])){integer(value);if(!namesFor(kind).includes(name)||value>allocationPolicy(draft).skillCap)throw new Error('技能無效或超過上限 75。');}
  fund(draft,kinds);ledger(draft);Object.assign(this.character,draft);
 }
 set(kind,name,value){
  integer(value);if(!(kind==='attr'?attributes:namesFor(kind)).includes(name))throw new Error('未知能力／技能。');
  this.transact(draft=>{draft[kind][name]=value;},kind==='attr'?['academic','skills']:[kind]);
 }
 roll(kind,rng=Math.random){
  if(kind==='attr'){this.transact(draft=>{draft.attr=rollAttributes(rng);},['academic','skills']);return;}
  if(!namesFor(kind).length)throw new Error('未知分類。');
  ledger(this.character);const draft=structuredClone(this.character);draft[kind]={};draft.contributions[kind]={};
  const engine=new AllocationEngine(draft);let possible=[...namesFor(kind)];
  // Each random increment uses precisely the same transaction as manual input.
  while(possible.length){const index=Math.floor(sample(rng)*possible.length),name=possible[index];
   try{engine.set(kind,name,(draft[kind][name]||0)+1);}catch{possible.splice(index,1);}
  }
  ledger(draft);Object.assign(this.character,draft);
 }
}
