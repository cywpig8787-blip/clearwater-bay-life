import {newCharacter} from './character-data.mjs';
import {validateAttributes} from './attribute-engine.mjs';
import {categories,rules} from './catalog.mjs';
import {categoryStatus,proficiencyRemaining} from './point-source-ledger.mjs';
import {schoolEligibility} from './school-eligibility.mjs';
import {pendingResidence} from './residence-interface.mjs';
export {newCharacter};
export function validateCharacter(s,roll){const errors=[];try{validateAttributes(s,true)}catch(e){errors.push(e.message)}
 for(const id of Object.keys(categories))if(categoryStatus(s,id).remaining<0)errors.push(`${id} 超額 ${-categoryStatus(s,id).remaining} 點`);
 if(proficiencyRemaining(s)<0)errors.push('熟練度超額');if(!s.basic.name.trim())errors.push('請輸入姓名');
 const m=+s.basic.month,d=+s.basic.day;if(!Number.isInteger(m)||m<1||m>12||!Number.isInteger(d)||d<1||d>([31,29,31,30,31,30,31,31,30,31,30,31][m-1]||0))errors.push('生日月／日無效');
 if(!s.motherTongue.trim())errors.push('請選擇母語');if(!roll?.locked)errors.push('家庭經濟尚未鎖定');if(!s.school||!schoolEligibility(s,s.school,roll).ok)errors.push('請選擇符合資格的學校');return errors;}
export function finishCharacter(s,roll){const errors=validateCharacter(s,roll);if(errors.length)throw Error(errors.join('；'));
 return {saveVersion:2,createdAt:new Date().toISOString(),runId:roll.id,phase:'preparation_week',weekDay:1,player:{identity:{...s.basic,nationality:s.nationality},portraitSource:s.appearance.portraitSource,attributes:structuredClone(s.attributes),skills:structuredClone(s.skills),motherTongue:s.motherTongue,proficiencies:structuredClone(s.proficiencies),knowledge:structuredClone(s.knowledge),familyFinance:structuredClone(roll.result),wallet:null,background:s.experience,schoolId:s.school,bodyTraits:structuredClone(s.bodyTraits),schoolRegistration:{schoolId:s.school},residence:pendingResidence(s.school)}};}
