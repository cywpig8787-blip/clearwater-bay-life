import {schools,financeTiers} from './catalog.mjs?v=cyw51-r10';
// CYW-51 2026-09-25: no body-trait or neutral-gender admission branch.
export function schoolEligibility(character,id,run){
 if(!schools[id])return {ok:false,why:'未知學校'};
 const gender=character?.basic?.gender;
 if(!['male','female'].includes(gender))return {ok:false,why:'請依現行規格選擇男性或女性'};
 const tier=financeTiers.findIndex(t=>t.id===run?.result?.id)+1;
 if(!run?.locked||!tier)return {ok:false,why:'請先完成家庭經濟投骰'};
 if(id==='girls'&&(gender!=='female'||tier<3))return {ok:false,why:'不符合羅莎蒙德入學資格'};
 if(id==='boys'&&(gender!=='male'||tier<2))return {ok:false,why:'不符合阿維諾入學資格'};
 // Sponsorship has no approved adjudication rules yet; it grants no automatic exception.
 return {ok:true,why:'符合入學資格'};
}
export function eligibleSchools(character,run){return Object.keys(schools).filter(id=>schoolEligibility(character,id,run).ok);}
