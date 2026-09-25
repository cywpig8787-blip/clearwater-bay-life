import {attributes,categories,proficiencyGroups,rules} from './catalog.mjs?v=cyw51-r9';
import {attributeTotal,clampAttribute,validateAttributes} from './attribute-engine.mjs?v=cyw51-r9';
import {categoryStatus,proficiencyRemaining} from './point-source-ledger.mjs?v=cyw51-r9';
const valid=n=>Number.isSafeInteger(n)&&n>=0;
export function allocate(s,kind,id,value){
 if(!valid(value))throw Error('請輸入非負整數。');
 if(kind==='attribute'){
  if(!attributes.includes(id))throw Error('未知能力值。');
  const draft=structuredClone(s),before=attributeTotal(s);draft.attributes[id]=value;
  if(before>rules.attributeTotal&&value<=s.attributes[id]&&attributeTotal(draft)<before){
   if(value>rules.attributeCap)throw Error(`能力值單項上限 ${rules.attributeCap}。`);
  }else validateAttributes(draft);
  s.attributes[id]=value;return value;
 }
 if(kind==='skill'){
  const category=s.skillCategory[id];if(!categories[category]||id!=='母語'&&!categories[category].skills.includes(id)&&!(category==='語言'&&s.otherLanguages.includes(id)))throw Error('未知技能。');
  const min=id==='母語'?rules.motherTongueBase:0;if(value<min||value>rules.skillCap)throw Error(`技能須為 ${min}–${rules.skillCap}。`);
  const before=s.skills[id]||0;s.skills[id]=value;if(value>before&&categoryStatus(s,category).remaining<0){s.skills[id]=before;throw Error(`${category} 點數不足。`);}return value;
 }
 if(kind==='proficiency'){
  const names=Object.values(proficiencyGroups).flat();if(!names.includes(id)&&!s.customProficiencies.includes(id))throw Error('未知熟練度。');
  if(value>rules.proficiencyCap)throw Error(`熟練度單項上限 ${rules.proficiencyCap}。`);
  const before=s.proficiencies[id]||0;s.proficiencies[id]=value;if(value>before&&proficiencyRemaining(s)<0){s.proficiencies[id]=before;throw Error('熟練度點數不足。');}return value;
 }
 throw Error('未知分配類型。');
}
export function adjust(s,kind,id,delta){
 if(!Number.isSafeInteger(delta))throw Error('無效調整量。');
 const current=kind==='attribute'?s.attributes[id]||0:kind==='skill'?s.skills[id]||0:s.proficiencies[id]||0;
 let value;
 if(kind==='attribute')value=clampAttribute(s,id,delta);
 else if(kind==='skill'){
  const category=s.skillCategory[id];if(!category)throw Error('未知技能。');
  const upper=Math.min(rules.skillCap,current+Math.max(0,categoryStatus(s,category).remaining));
  value=Math.max(id==='母語'?rules.motherTongueBase:0,Math.min(upper,current+delta));
 } else if(kind==='proficiency')value=Math.max(0,Math.min(Math.min(rules.proficiencyCap,current+Math.max(0,proficiencyRemaining(s))),current+delta));
 else throw Error('未知分配類型。');
 allocate(s,kind,id,value);return value;
}
export function attributePointsRemaining(s){return rules.attributeTotal-attributeTotal(s)}

// Random choices still enter through allocate, so every cap and ledger check applies.
export function randomizeAttributes(s,rng=Math.random){
 const draft=structuredClone(s);draft.attributes=Object.fromEntries(attributes.map(id=>[id,0]));
 while(attributePointsRemaining(draft)>0){
  const available=attributes.filter(id=>draft.attributes[id]<rules.attributeCap);
  const id=available[Math.floor(rng()*available.length)];
  allocate(draft,'attribute',id,draft.attributes[id]+1);
 }
 s.attributes=draft.attributes;
 return s.attributes;
}
export function randomizeSkills(s,rng=Math.random){
 for(const id of Object.keys(s.skills))allocate(s,'skill',id,id==='母語'?rules.motherTongueBase:0);
 for(const [category,group] of Object.entries(categories)){
  const ids=[...group.skills,...(category==='語言'?s.otherLanguages:[])];
  while(categoryStatus(s,category).remaining>0){
   const available=ids.filter(id=>(s.skills[id]||0)<rules.skillCap);
   if(!available.length)break;
   const id=available[Math.floor(rng()*available.length)];
   allocate(s,'skill',id,(s.skills[id]||0)+1);
  }
 }
 return s.skills;
}

export function randomizeProficiencies(s,rng=Math.random){
 const draft=structuredClone(s);
 const ids=[...new Set([...Object.values(proficiencyGroups).flat(),...s.customProficiencies])];
 draft.proficiencies={};
 while(proficiencyRemaining(draft)>0){
  const available=ids.filter(id=>(draft.proficiencies[id]||0)<rules.proficiencyCap);
  const roll=rng();if(!Number.isFinite(roll)||roll<0||roll>=1)throw Error('無效隨機值。');
  const id=available[Math.floor(roll*available.length)];
  allocate(draft,'proficiency',id,(draft.proficiencies[id]||0)+1);
 }
 s.proficiencies=draft.proficiencies;
 return s.proficiencies;
}
