import {attributes,categories,rules} from './catalog.mjs';
import {validateAttributes} from './attribute-engine.mjs';
import {categoryStatus,proficiencyRemaining} from './point-source-ledger.mjs';
const valid=n=>Number.isSafeInteger(n)&&n>=0;
export function allocate(s,kind,id,value){if(!valid(value))throw Error('請輸入非負整數。');
 if(kind==='attribute'){if(!attributes.includes(id))throw Error('未知能力值。');const copy=structuredClone(s);copy.attributes[id]=value;validateAttributes(copy);s.attributes[id]=value;return;}
 if(kind==='skill'){const category=s.skillCategory[id];if(!categories[category]||id!=='母語'&&!categories[category].skills.includes(id)&&!(category==='語言'&&s.otherLanguages.includes(id)))throw Error('未知技能。');const min=id==='母語'?rules.motherTongueBase:0;if(value<min||value>rules.skillCap)throw Error(`技能須為 ${min}–65。`);const before=s.skills[id]||0;s.skills[id]=value;if(value>before&&categoryStatus(s,category).remaining<0){s.skills[id]=before;throw Error(`${category} 點數不足。`);}return;}
 if(kind==='proficiency'){const names=Object.values((awaitCatalog())).flat();if(!names.includes(id)&&!s.customProficiencies.includes(id))throw Error('未知熟練度。');if(value>rules.proficiencyCap)throw Error('熟練度上限 75。');const before=s.proficiencies[id]||0;s.proficiencies[id]=value;if(proficiencyRemaining(s)<0){s.proficiencies[id]=before;throw Error('熟練度點數不足。');}return;}
 throw Error('未知分配類型。');}
import {proficiencyGroups} from './catalog.mjs';
function awaitCatalog(){return proficiencyGroups;}
