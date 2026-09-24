import {attributes,rules} from './catalog.mjs';
export function integer(value){if(!Number.isSafeInteger(value)||value<0)throw new Error('請輸入非負安全整數。');return value;}
export function validateAttributes(values,{override=false,complete=false}={}){
 for(const id of attributes){integer(values[id]);if(!override&&values[id]>rules.attributeCap)throw new Error('能力值單項上限為 65。');}
 const total=attributes.reduce((n,id)=>n+values[id],0);integer(total);
 if(!override&&(total>250||(complete&&total!==250)))throw new Error('能力值總額須為 250；編輯時可保留未分配點數。');
}
export function sample(rng){const n=rng();if(!Number.isFinite(n)||n<0||n>=1)throw new Error('無效隨機值。');return n;}
export function rollAttributes(rng){
 const values=Object.fromEntries(attributes.map(id=>[id,0]));
 for(let n=0;n<250;n++){const eligible=attributes.filter(id=>values[id]<65);values[eligible[Math.floor(sample(rng)*eligible.length)]]++;}
 return values;
}
