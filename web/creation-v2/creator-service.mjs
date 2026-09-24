import {newCharacter,canonicalGender} from './character-data.mjs';
import {AllocationEngine} from './allocation-engine.mjs';
import {validateAttributes} from './attribute-engine.mjs';
import {allocationPolicy} from './developer-override.mjs';
import {ledger} from './point-source-ledger.mjs';
import {validateSchool} from './school-eligibility.mjs';
import {withoutAssignment} from './residence-assignment.mjs';
export {academics,groups,attributes,schools,houses} from './character-data.mjs';
export {residenceFields} from './residence-assignment.mjs';
export const setScore=(s,kind,name,value)=>new AllocationEngine(s).set(kind,name,value);
export const randomizeScores=(s,kind,_names,rng)=>new AllocationEngine(s).roll(kind,rng);
export function validateCharacter(s,{normal=false,complete=false}={}){
 try{validateAttributes(s.attr,{...allocationPolicy(s,{normal}),complete});ledger(s,{normal});return [];}catch(e){return [e.message];}
}
export function creatorPlayer(s){
 const copy=withoutAssignment(s);copy.creationPoints=ledger(s);copy.basic.gender=canonicalGender(copy.basic.gender);
 copy.genderIdentity=copy.basic.gender;copy.schoolRegistration={schoolId:copy.school,houseId:copy.house||null};return copy;
}
export function finishCharacter(s){
 const errors=validateCharacter(s,{complete:true});if(errors.length)throw new Error(errors.join(' '));validateSchool(s);
 if(!s.basic.name.trim())throw new Error('請輸入姓名。');
 const match=/^(\d{1,2})\/(\d{1,2})$/.exec(s.basic.birthday);
 if(!match)throw new Error('生日請輸入月／日。');
 const month=Number(match[1]),day=Number(match[2]),days=[31,29,31,30,31,30,31,31,30,31,30,31];
 if(!days[month-1]||day<1||day>days[month-1])throw new Error('生日月／日無效。');
 return {saveVersion:1,createdAt:new Date().toISOString(),player:creatorPlayer(s)};
}
export function loadDraft(raw){
 if(!raw)return newCharacter();
 const value=JSON.parse(raw);if(value.version!==2)throw new Error('此草稿不是 v2。');
 ledger(value);return withoutAssignment(value);
}
