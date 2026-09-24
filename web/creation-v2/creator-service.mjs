import {newCharacter} from './character-data.mjs?v=cyw51-r3';
import {validateAttributes} from './attribute-engine.mjs?v=cyw51-r3';
import {categories,rules,proficiencyGroups} from './catalog.mjs?v=cyw51-r3';
import {categoryStatus,proficiencyRemaining} from './point-source-ledger.mjs?v=cyw51-r3';
export {newCharacter};
export function validateCharacter(s,run){
 const errors=[];try{validateAttributes(s,true)}catch(e){errors.push(e.message)}
 for(const id of Object.keys(categories)){const status=categoryStatus(s,id);if(status.remaining<0)errors.push(`${id} 超額 ${-status.remaining} 點`)}
 for(const [id,value] of Object.entries(s.skills)){if(!Number.isSafeInteger(value)||value>(id==='母語'?rules.skillCap:rules.skillCap))errors.push(`技能數值無效：${id}`)}
 for(const [id,value] of Object.entries(s.proficiencies)){if(!Number.isSafeInteger(value)||value<0||value>rules.proficiencyCap)errors.push(`熟練度數值無效：${id}`)}
 if(proficiencyRemaining(s)<0)errors.push('熟練度超額');
 if(!s.basic.name.trim())errors.push('請輸入姓名');
 const m=+s.basic.month,d=+s.basic.day;if(!Number.isInteger(m)||m<1||m>12||!Number.isInteger(d)||d<1||d>([31,29,31,30,31,30,31,31,30,31,30,31][m-1]||0))errors.push('生日月／日無效');
 if(!['male','female','neutral'].includes(s.basic.gender))errors.push('請選擇性別');
 if(!s.motherTongue.trim())errors.push('請選擇母語');
 if(!run?.locked)errors.push('家庭經濟尚未投骰並鎖定');
 return [...new Set(errors)];
}
export function confirmCharacterData(s,run){const errors=validateCharacter(s,run);if(errors.length)throw Error(errors.join('；'));return true;}
export function validateProficiencyNames(s){const names=new Set(Object.values(proficiencyGroups).flat());for(const name of s.customProficiencies)if(names.has(name)||Object.values(categories).some(c=>c.skills.includes(name)))throw Error('自訂熟練項目不可重複正式技能或熟練項目。');return true;}
