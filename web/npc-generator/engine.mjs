import {fields,pools as visualPools} from './catalog.mjs';
import {styles,families,styleOptions} from './fashion.mjs';
import {allowed,compatible,candidates,dependencies,featureOptions,issues,wardrobe} from './rules.mjs';
export {fields,styles,families,issues};
export const pools={...visualPools,feature:featureOptions};
export const modes={all:fields.map(f=>f.id)};
export const createState=()=>({version:3,mode:'all',values:{},locked:{},recent:{},history:[],count:0});
export function seeded(seed){let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
const draw=rng=>{const n=rng();if(!Number.isFinite(n)||n<0||n>=1)throw Error('無效隨機值');return n;};
export function pick(items,recent=[],rng=Math.random,weight=x=>x.weight??1){
 if(!items?.length)throw Error('沒有相容選項；請解鎖相關欄位。');
 const fresh=items.filter(x=>!recent.includes(x.label)),p=fresh.length?fresh:items;
 const ws=p.map(weight);if(ws.some(n=>!Number.isFinite(n)||n<=0))throw Error('無效權重');
 let n=draw(rng)*ws.reduce((a,b)=>a+b,0);
 for(let i=0;i<p.length;i++){n-=ws[i];if(n<0)return structuredClone(p[i]);}return structuredClone(p.at(-1));
}
export function lockAll(state){const s=structuredClone(state);for(const f of fields)if(s.values[f.id])s.locked[f.id]=true;return s;}
export const unlockAll=state=>({...state,locked:{}});
export const clearCharacter=state=>({...createState(),history:state.history,recent:state.recent,count:state.count});
function descendants(target,id){for(const d of dependencies[id]||[])if(!target.has(d)){target.add(d);descendants(target,d);}}
function validWithExisting(id,x,v){const next={...v,[id]:x};return allowed(id,x,v)&&Object.entries(next).every(([k,item])=>compatible(k,item,next));}
function poolFor(id,v,rng){
 if(id==='feature'){
  const p=draw(rng),count=p<.5?0:p<.9?1:2;
  return featureOptions.filter(x=>x.marks.length===count);
 }
 if(id==='hairColor'){
  const kind=draw(rng)<.75?'natural':'dyed';
  return pools.hairColor.filter(x=>x.kind===kind);
 }
 return candidates(id,v);
}
export function roll(state,{only=null,rng=Math.random}={}){
 if(only&&!modes.all.includes(only))throw Error('未知欄位');
 const s=structuredClone(state),target=new Set(only?[only]:modes.all);
 if(only&&s.locked[only])return {state,changed:[],notes:issues(state)};
 for(const f of fields)if(!s.values[f.id])target.add(f.id);
 for(const id of [...target])if(!s.locked[id])descendants(target,id);
 const changed=[];
 // Remove every mutable target first: locked or unrelated values constrain their replacements.
 for(const id of target)if(!s.locked[id]||!s.values[id])delete s.values[id];
 for(const {id} of fields){
  if(s.values[id])continue;
  const available=poolFor(id,s.values,rng).filter(x=>validWithExisting(id,x,s.values));
  const value=pick(available,s.recent[id]||[],rng);
  s.values[id]=value;s.recent[id]=[...(s.recent[id]||[]),value.label].slice(-8);changed.push(id);
 }
 if(issues(s).length)throw Error('無法保留所有鎖定搭配；請解鎖相關欄位。');
 if(changed.length){s.count++;s.history.unshift({number:s.count,values:structuredClone(s.values)});s.history=s.history.slice(0,100);}
 return {state:s,changed,notes:[]};
}
export function textFor(s){
 const groups=[...new Set(fields.map(f=>f.group))];
 return 'Clearwater Bay Life｜純外貌視覺種子 #'+s.count+'\n'+groups.map(group=>{
  const lines=fields.filter(f=>f.group===group&&s.values[f.id]?.label).map(f=>f.label+'：'+s.values[f.id].label);
  return lines.length?'\n【'+group+'】\n'+lines.join('\n'):'';
 }).filter(Boolean).join('\n');
}
function allCandidates(id){
 if(id==='core')return styles;
 if(id==='feature')return featureOptions;
 if(wardrobe.includes(id))return styles.flatMap(s=>styleOptions(s,id));
 return pools[id]||[];
}
const catalogs=Object.fromEntries(fields.map(({id})=>[id,new Map(allCandidates(id).map(x=>[x.label,x]))]));
function sanitizeValues(raw){
 const values={};
 for(const {id} of fields){
  const x=catalogs[id].get(raw?.[id]?.label);
  if(x&&validWithExisting(id,x,values))values[id]=structuredClone(x);
 }
 return values;
}
export function restore(raw){
 const s=createState();if(!raw||![2,3].includes(raw.version))return s;
 s.values=sanitizeValues(raw.values);
 for(const {id} of fields){
  if(s.values[id]&&raw.locked?.[id]===true)s.locked[id]=true;
  if(Array.isArray(raw.recent?.[id]))s.recent[id]=raw.recent[id].filter(x=>catalogs[id].has(x)).slice(-8);
 }
 s.count=Number.isSafeInteger(raw.count)&&raw.count>=0?raw.count:0;
 if(Array.isArray(raw.history))s.history=raw.history.slice(0,100).filter(h=>h&&Number.isSafeInteger(h.number)&&h.number>=0).map(h=>({number:h.number,values:sanitizeValues(h.values)})).filter(h=>Object.keys(h.values).length);
 return s;
}
