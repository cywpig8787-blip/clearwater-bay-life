const KEY='clearwater-life-run-finance-v2';
export function readRun(storage=localStorage){try{return JSON.parse(storage.getItem(KEY)||'null')}catch{return null}}
export function newRun(storage=localStorage,id=crypto.randomUUID()){const run={id,locked:false,result:null};storage.setItem(KEY,JSON.stringify(run));return run;}
export function rollFinance(storage=localStorage,selector){let run=readRun(storage)||newRun(storage);if(run.locked)return run;
 // Distribution is not finalized in CYW-51. A production roll requires an injected approved policy.
 if(typeof selector!=='function')throw Error('家庭經濟機率尚未定稿；目前不能進行一般模式正式投骰。');
 const result=selector();if(!result?.tierId)throw Error('家庭經濟結果無效。');run={...run,locked:true,result};storage.setItem(KEY,JSON.stringify(run));return run;}
export function developerFinance(storage=localStorage,result){const run=readRun(storage)||newRun(storage);if(!result?.tierId)throw Error('缺少測試層級。');const next={...run,locked:true,result,developerOverride:true};storage.setItem(KEY,JSON.stringify(next));return next;}
