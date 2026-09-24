import {attributes,categories,proficiencyGroups,rules} from './catalog.mjs?v=cyw51-r3';
import {attributeTotal,clampAttribute,validateAttributes} from './attribute-engine.mjs?v=cyw51-r3';
import {categoryStatus,proficiencyRemaining} from './point-source-ledger.mjs?v=cyw51-r3';
const valid=n=>Number.isSafeInteger(n)&&n>=0;
export function allocate(s,kind,id,value){
 if(!valid(value))throw Error('請輸入非負整數。');
 if(kind==='attribute'){
  if(!attributes.includes(id))throw Error('未知能力值。');
  const draft=structuredClone(s);draft.attributes[id]=value;validateAttributes(draft);s.attributes[id]=value;return value;
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
