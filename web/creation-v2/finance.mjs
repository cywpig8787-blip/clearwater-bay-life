import {financeTiers} from './catalog.mjs?v=cyw51-r5';
const KEY='clearwater-life-run-finance-v2';
export function readRun(storage=localStorage){try{const r=JSON.parse(storage.getItem(KEY)||'null');return r?.locked&&!financeTiers.some(t=>t.id===r.result?.id)?null:r}catch{return null}}
export function newRun(storage=localStorage,id=crypto.randomUUID()){const run={id,locked:false,result:null};storage.setItem(KEY,JSON.stringify(run));return run;}
export function rollFinance(storage=localStorage,rng=Math.random){
 const run=readRun(storage)||newRun(storage);if(run.locked)return run;
 const n=rng();if(!Number.isFinite(n)||n<0||n>=1)throw Error('無效隨機值。');
 const result=financeTiers[Math.floor(n*5)];
 const locked={...run,locked:true,result:{...result},roll:n};storage.setItem(KEY,JSON.stringify(locked));return locked;
}
export function developerFinance(storage=localStorage,result){
 const run=readRun(storage)||newRun(storage);if(!financeTiers.some(t=>t.id===result?.tierId))throw Error('未知家庭經濟層級。');
 const locked={...run,locked:true,developerOverride:true,result:{...financeTiers.find(t=>t.id===result.tierId)}};storage.setItem(KEY,JSON.stringify(locked));return locked;
}
