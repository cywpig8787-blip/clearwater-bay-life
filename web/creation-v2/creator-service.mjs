import {newCharacter} from './character-data.mjs?v=cyw51-r12-final';
import {validateAttributes} from './attribute-engine.mjs?v=cyw51-r10';
import {categories,rules,proficiencyGroups} from './catalog.mjs?v=cyw51-r10';
import {categoryStatus,proficiencyRemaining} from './point-source-ledger.mjs?v=cyw51-r10';
export {newCharacter};
export function validatePage(s,run,page){
 const errors=[];
 if(page===0){
  for(const [key,label] of [['lastName','姓氏'],['firstName','名字'],['pronouns','代名詞']])if(!s.basic[key]?.trim())errors.push('請輸入'+label);
  const m=+s.basic.month,d=+s.basic.day;
  if(!Number.isInteger(m)||m<1||m>12||!Number.isInteger(d)||d<1||d>[31,29,31,30,31,30,31,31,30,31,30,31][m-1])errors.push('請選擇有效生日月／日');
  if(!['male','female'].includes(s.basic.gender))errors.push('請選擇性別');
 }
 if(page===1){if(!run?.locked)errors.push('請先投擲並鎖定家庭經濟');if(!s.nationality?.trim())errors.push('請輸入國籍／地區');}
 if(page===2){try{validateAttributes(s,true)}catch(e){errors.push(e.message)}}
 if(page===3){
  if(!s.motherTongue?.trim())errors.push('請選擇母語');
  if(Object.entries(s.skills).every(([id,value])=>value<=(id==='母語'?rules.motherTongueBase:0)))errors.push('請分配至少一項技能');
  for(const id of Object.keys(categories)){const status=categoryStatus(s,id);if(status.remaining<0)errors.push(id+' 超額 '+(-status.remaining)+' 點');}
  for(const [id,value] of Object.entries(s.skills))if(!Number.isSafeInteger(value)||value<(id==='母語'?rules.motherTongueBase:0)||value>rules.skillCap||!s.skillCategory[id])errors.push('技能數值無效：'+id);
 }
 if(page===4){
  if(proficiencyRemaining(s)<0)errors.push('熟練度超額，總點數上限 '+rules.proficiencyTotal);
  if(!Object.values(s.proficiencies).some(value=>value>0))errors.push('請分配至少一項熟練度');
  for(const [id,value] of Object.entries(s.proficiencies))if(!Number.isSafeInteger(value)||value<0||value>rules.proficiencyCap)errors.push('熟練度數值無效：'+id);
 }
 return errors;
}
export function validateCharacter(s,run){return [...new Set([0,1,2,3,4].flatMap(page=>validatePage(s,run,page)))];}
export function pageGate(s,run,page){return [...new Set(Array.from({length:page},(_,i)=>validatePage(s,run,i)).flat())];}
export function confirmCharacterData(s,run){const errors=validateCharacter(s,run);if(errors.length)throw Error(errors.join('；'));return true;}
export function validateProficiencyNames(s){const names=new Set(Object.values(proficiencyGroups).flat());for(const name of s.customProficiencies)if(names.has(name)||Object.values(categories).some(c=>c.skills.includes(name)))throw Error('自訂熟練項目不可重複正式技能或熟練項目。');return true;}
