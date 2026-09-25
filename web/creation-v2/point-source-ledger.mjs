import {categories,rules} from './catalog.mjs?v=cyw51-r9';
export function categoryBudget(s,id){const [a,b]=categories[id].pair;const A=s.attributes[a],B=s.attributes[b];return A+B+Math.floor(A*B/100);}
export function categoryAllocation(s,id){return Object.entries(s.skills).reduce((n,[key,value])=>n+(key==='母語'?(id==='語言'?Math.max(0,value-rules.motherTongueBase):0):s.skillCategory[key]===id?value:0),0);}
export function categoryStatus(s,id){const total=categoryBudget(s,id),allocated=categoryAllocation(s,id);return {total,allocated,remaining:total-allocated,pair:categories[id].pair};}
export const proficiencyRemaining=s=>rules.proficiencyTotal-Object.values(s.proficiencies).reduce((n,v)=>n+v,0);
