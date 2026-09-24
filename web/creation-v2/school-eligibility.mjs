import {canonicalGender,schools,houses} from './character-data.mjs';
export function schoolEligibility(s,id){
 if(!schools[id])return {ok:false,why:'未知學校'};
 const gender=canonicalGender(s.basic.gender);
 if(!['male','female','neutral'].includes(gender))return {ok:false,why:'請選擇角色性別'};
 if(id==='coed')return {ok:true,why:'公立混校，可申請'};
 if((id==='girls'&&gender==='male')||(id==='boys'&&gender==='female'))return {ok:false,why:'目前角色資料不符合入學資格'};
 if(id==='boys'&&gender==='neutral'&&s.bodyTraits?.chest!=='flat')return {ok:false,why:'中性角色需符合平胸身體資料條件'};
 if(s.family.finance!=='富裕')return {ok:false,why:'目前家庭財政未達私校一般入學條件'};
 return {ok:true,why:'符合目前測試資格'};
}
export function validateSchool(s){
 if(!schoolEligibility(s,s.school).ok)throw new Error('請選擇符合資格的學校。');
 if(s.school==='girls'&&!houses.includes(s.house))throw new Error('請選擇 Rosamund 學院。');
 if(s.school==='boys'&&!['campus','offcampus'].includes(s.residence))throw new Error('請選擇 Avenor 校內或校外住宿。');
}
