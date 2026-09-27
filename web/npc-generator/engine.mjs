import {fields as baseFields,pools as basePools,plain} from './catalog.mjs';
import {retained} from './retained.mjs';
import {styles,families,familyById,styleOptions,everydayIds,fashionFields,extraPools,boldTwists} from './fashion.mjs';
const internalFields=[...baseFields,...fashionFields];
const removedFields=new Set(['posture','access','direction','upkeep','activity','clothingSource','familyRules','sensory','culture','motivation','friction','attitude','styleFamily','formality','tidiness','coordination','dailyWear','climate','depth','socialStart','learning','family','familyDynamic','twist','makeup','items','occasionWear']);
export const fields=internalFields.filter(f=>!removedFields.has(f.id));
export const modes={all:fields.map(f=>f.id)};
export const pools={...basePools,...retained,...extraPools};
pools.unlikedTalent=pools.interest;
pools.likedNovice=pools.interest;
export {styles,families};
export function seeded(seed){let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
export const createState=()=>({version:2,mode:'all',values:{},locked:{},recent:{},history:[],count:0});
const draw=rng=>{const n=rng();if(!Number.isFinite(n)||n<0||n>=1)throw Error('無效隨機值');return n;};
export function pick(items,recent=[],rng=Math.random,weight=x=>x.weight||1){
 if(!items?.length)throw Error('沒有可用選項');
 const fresh=items.filter(x=>!recent.includes(x.label));const p=fresh.length?fresh:items;
 const ws=p.map(weight);let n=draw(rng)*ws.reduce((a,b)=>a+b,0);
 for(let i=0;i<p.length;i++){n-=ws[i];if(n<0)return structuredClone(p[i]);}return structuredClone(p.at(-1));
}
const getStyle=s=>styles.find(x=>x.id===s.values.core?.id);
const wardrobe=new Set(['silhouette','material','palette','shoes','accessory']);
const derived=new Set(['attitude','styleFamily','items','formality','coordination','dailyWear','occasionWear']);
export function lockAll(state){const next=structuredClone(state);for(const f of internalFields)if(!derived.has(f.id)&&next.values[f.id])next.locked[f.id]=true;return next;}
export function unlockAll(state){return {...state,locked:{}};}
export function clearCharacter(state){return {...createState(),mode:state.mode,history:state.history,recent:state.recent,count:state.count};}
// This is a dependency graph, not a personality graph: fashion never changes a mind.
const dependencies={
 core:['attitude','styleFamily','silhouette','material','palette','shoes','accessory','twist','hair','makeup','items','formality','coordination','dailyWear','occasionWear'],
 silhouette:['items','dailyWear'],resource:['access','clothingSource','dailyWear'],
 interest:['depth','unlikedTalent','likedNovice','dailyWear'],unlikedTalent:['likedNovice'],depth:[],
 twist:['dailyWear'],climate:['dailyWear'],activity:['dailyWear'],sensory:['dailyWear'],upkeep:['coordination','dailyWear'],familyRules:['dailyWear'],clothingSource:['dailyWear']
};
const order=['gender','body','feature','face','skin','eyes','personality','social','intimacy','interest','unlikedTalent','likedNovice','quirk','voice','resource','family','familyDynamic','learning','socialStart','depth','direction','habit','motivation','friction','access','climate','activity','sensory','upkeep','familyRules','culture','clothingSource','core','attitude','styleFamily','silhouette','material','palette','shoes','accessory','hair','hairColor','hairTexture','makeup','posture','skinDetail','tidiness','formality','coordination','twist','items','dailyWear','occasionWear'];
function addDescendants(target,id){for(const d of dependencies[id]||[])if(!target.has(d)){target.add(d);addDescendants(target,d);}}
function remember(s,id,item){s.values[id]=item;s.recent[id]=[...(s.recent[id]||[]),item.label].slice(-8);}
function candidatePool(id,s,rng){
 const st=getStyle(s);
 if(id==='core'){
  // Roll everyday versus defined aesthetic before selecting a substyle; pool size cannot swamp ordinary students.
  const ordinary=draw(rng)<.55;
  if(ordinary)return styles.filter(x=>x.family==='everyday');
  const f=pick(families.filter(x=>x.id!=='everyday'),[],rng);
  return styles.filter(x=>x.family===f.id);
 }
 if(wardrobe.has(id))return styleOptions(st,id);
 if(id==='access')return pools.access.filter(x=>x.levels.includes(s.values.resource.level));
 if(id==='clothingSource')return pools.clothingSource.filter(x=>(x.minResource||0)<=s.values.resource.level);
 if(id==='unlikedTalent')return pools.interest.filter(x=>x.label!==s.values.interest.label);
 if(id==='likedNovice')return pools.interest.filter(x=>![s.values.interest.label,s.values.unlikedTalent.label].includes(x.label));
 if(id==='twist'){
  const bold=boldTwists.filter(x=>(!x.families||x.families.includes(st.family))&&(!x.styles||x.styles.includes(st.id))&&(!x.override||!s.locked[x.override]));
  return draw(rng)<.12&&bold.length?bold:pools.twist;
 }
 return pools[id];
}
function derive(id,s){
 const v=s.values,st=getStyle(s),f=familyById[st.family];
 const item=label=>({label});
 if(id==='attitude')return item(st.family==='everyday'?st.label:'有明確偏好，但不代表每天盛裝');
 if(id==='styleFamily')return item(f.label);
 if(id==='items')return item(v.silhouette.label.replaceAll('＋','、'));
 if(id==='formality')return item(['tailoring','academia','lolita'].includes(st.family)?'日常偏端正；正式活動才增加完整配件':st.family==='everyday'?'平日休閒，依場合整理一下':'平日保留辨識元素，盛裝版另外準備');
 if(id==='coordination')return item(st.family==='everyday'?(st.id==='occasion-only'?'平日省心，重要約定才花時間':st.id==='unnamed-pretty'?'會看顏色與喜不喜歡，不研究派系':'依照穿慣的組合，方便為先'):(v.upkeep.label.includes('兩分鐘')?'沿用前晚或平常配好的公式':v.upkeep.label.includes('好洗')?'在意搭配，也優先挑好洗的版本':'會留意輪廓與主色呼應'));
 if(id==='occasionWear')return item(st.family==='everyday'?'特別場合換乾淨襯衫或簡單洋裝，鞋子整理好':['gothic','lolita','vintage','tailoring'].includes(st.family)?'重要聚會增加同系列外套、領口與髮飾；平日省去大件裝飾':'重要聚會保留原本剪裁，換狀況較好的單品與一件重點配件');
 if(id==='dailyWear'){
  const weather={warm:'天暖時選薄料，把外層換成可脫的輕薄版本',cool:'有風時帶一件容易脫下的外層',rain:'雨天另帶防雨外層與鞋套，布料不拖地',cold:'冬日加保暖內層、外套與保暖襪'}[v.climate.kind];
  return item(weather+'。');
 }
}
function weightFor(id,s){const st=getStyle(s);return x=>{
 if(id==='gender'){const special=['男裝女','女裝男'];return special.includes(x.label)&&(s.recent.gender||[]).some(x=>special.includes(x))?6:x.weight;}
 if(['hair','makeup'].includes(id)&&x.tags)return x.tags.some(t=>st.tags.includes(t))?1.7:1;
 return x.weight||1;
};}
export function issues(s){
 const v=s.values,st=getStyle(s),out=[];if(!st)return out;
 for(const id of wardrobe){const item=v[id];if(!item)continue;if(!styleOptions(st,id).some(x=>x.label===item.label)&&!item.twist)out.push(`${fields.find(f=>f.id===id).label}是保留的個人混搭，沒有隨新審美改動。`);}
 if(v.unlikedTalent?.label===v.interest?.label||[v.interest?.label,v.unlikedTalent?.label].includes(v.likedNovice?.label))out.push('興趣／擅長與喜歡欄位因鎖定出現重疊，可解鎖其中一欄再抽。');
 return out;
}
export function roll(state,{only=null,rng=Math.random}={}){
 const s=structuredClone(state),target=new Set(only?[only]:modes[s.mode]);
 if(only&&!fields.some(f=>f.id===only))throw Error('未知欄位');
 if(only&&s.locked[only])return {state,changed:[],notes:issues(state)};
 // Retain shared underlying values for the existing generation dependencies.
 for(const f of internalFields)if(!s.values[f.id])target.add(f.id);
 if(![...target].some(id=>!derived.has(id)&&(!s.locked[id]||!s.values[id])))return {state,changed:[],notes:issues(state)};
 for(const id of [...target])if(!s.locked[id])addDescendants(target,id);
 const previousTwist=s.values.twist;
 if(previousTwist?.override&&target.has('twist')&&!s.locked.twist)target.add(previousTwist.override);
 if(only&&previousTwist?.override===only&&!s.locked.twist)target.add('twist');
 const changed=[];
 for(const id of order){
  if(!target.has(id))continue;
  if(s.locked[id]&&s.values[id]){
   if(id==='twist'&&s.values.twist.override&&!s.locked[s.values.twist.override]){
    remember(s,s.values.twist.override,{label:s.values.twist.effect,twist:true});changed.push(s.values.twist.override);
   }
   continue;
  }
  const value=derived.has(id)?derive(id,s):pick(candidatePool(id,s,rng),s.recent[id]||[],rng,weightFor(id,s));
  remember(s,id,value);changed.push(id);
  if(id==='twist'&&value.override&&!s.locked[value.override]){
   remember(s,value.override,{label:value.effect,twist:true});changed.push(value.override);
  }
 }
 if(changed.length){s.count++;s.history.unshift({number:s.count,values:structuredClone(s.values)});s.history=s.history.slice(0,100);}
 return {state:s,changed:[...new Set(changed)],notes:issues(s)};
}
export function textFor(s,{all=true}={}){const ids=all?fields.map(f=>f.id):modes[s.mode];return 'ACG 人體煉成轉蛋機 v2｜#'+s.count+'\n'+fields.filter(f=>ids.includes(f.id)&&s.values[f.id]).map(f=>f.label+'：'+s.values[f.id].label).join('\n')+'\n（角色草案；學校與 House 留待人工判斷）';}
export function restore(raw){
 const s=createState();if(!raw||raw.version!==2)return s;
 s.mode='all';
 // Only accept known fields and catalog values; derived text is rebuilt from validated choices.
 for(const f of internalFields){const x=raw.values?.[f.id];if(!x||typeof x.label!=='string')continue;
  const candidates=f.id==='core'?[...styles]:wardrobe.has(f.id)?styles.flatMap(st=>styleOptions(st,f.id)):[...(pools[f.id]||[])];
  if(f.id==='twist')candidates.push(...boldTwists);
  for(const t of boldTwists)if(t.override===f.id)candidates.push({label:t.effect,twist:true});
  const item=candidates.find(c=>c.label===x.label);
  if(item)s.values[f.id]=structuredClone(item);
  if(item&&raw.locked?.[f.id])s.locked[f.id]=true;
 }
 for(const f of internalFields){const a=raw.recent?.[f.id];if(Array.isArray(a))s.recent[f.id]=a.filter(x=>typeof x==='string'&&x.length<300).slice(-8);}
 s.count=Number.isSafeInteger(raw.count)&&raw.count>=0?raw.count:0;
 // History is display-only and rendered with textContent, never interpreted as HTML.
 if(Array.isArray(raw.history))s.history=raw.history.slice(0,100).filter(h=>Number.isSafeInteger(h.number)&&h.values&&typeof h.values==='object');
 if(s.values.core&&s.values.resource){for(const id of order)if(derived.has(id)&&Object.keys(s.values).length>30){try{s.values[id]=derive(id,s);}catch{}}}
 return s;
}

