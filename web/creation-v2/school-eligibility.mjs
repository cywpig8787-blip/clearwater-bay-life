import {schools} from './catalog.mjs';
export function schoolEligibility(s,id,roll){if(!schools[id])return {ok:false,why:'未知學校'};if(!roll?.locked)return {ok:false,why:'請先完成家庭經濟投骰'};
 const gender=s.basic.gender;if(id==='girls'&&gender==='male'||id==='boys'&&gender==='female')return {ok:false,why:'角色性別不符合入學資格'};
 if(id==='boys'&&gender==='neutral'&&s.bodyTraits.chest!== 'flat')return {ok:false,why:'中性角色的入學身體條件尚未確認'};
 return {ok:true,why:'符合目前已定義的資格'};}
