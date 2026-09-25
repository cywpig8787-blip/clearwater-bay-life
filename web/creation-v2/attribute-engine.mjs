import {attributes,rules} from './catalog.mjs?v=cyw51-r9';
export const attributeTotal=s=>attributes.reduce((n,id)=>n+s.attributes[id],0);
export function validateAttributes(s,complete=false){
 for(const id of attributes)if(!Number.isSafeInteger(s.attributes[id])||s.attributes[id]<0||s.attributes[id]>rules.attributeCap)throw Error(`${id} 必須在 0–65。`);
 const total=attributeTotal(s);if(total>rules.attributeTotal||complete&&total!==rules.attributeTotal)throw Error('能力值總值必須為 150。');
}
export function clampAttribute(s,id,delta){
 const current=s.attributes[id],remaining=rules.attributeTotal-attributeTotal(s);
 const upper=Math.min(rules.attributeCap,current+remaining);
 return Math.max(0,Math.min(upper,current+delta));
}
