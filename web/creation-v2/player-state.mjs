import {confirmCharacterData} from './creator-service.mjs?v=cyw51-r10';
import {eligibleSchools,schoolEligibility} from './school-eligibility.mjs?v=cyw51-r10';
// Promote the existing draft slot atomically: large portrait data is stored once.
export const PLAYER_KEY='clearwater-life-creator-v4';
export const openingRoutes=Object.freeze({coed:'ravenwood-arrival',girls:'rosamund-grand-hall-arrival',boys:'avenor-arrival'});
const clone=value=>JSON.parse(JSON.stringify(value));
export function validatePlayerState(state){
 if(state?.version!==1||!['school-selection','school-confirmed'].includes(state.phase))throw Error('玩家存檔格式不符');
 if(!state.run?.id||state.runId!==state.run.id)throw Error('本局識別不符');
 confirmCharacterData(state.creatorResult,state.run);
 if(!eligibleSchools(state.creatorResult,state.run).length)throw Error('沒有符合資格的學校');
 if(state.phase==='school-selection'&&(state.selectedSchool!==null||state.openingFlow!==null))throw Error('未確認學校不得保存入學結果');
 if(state.phase==='school-confirmed'&&(!schoolEligibility(state.creatorResult,state.selectedSchool,state.run).ok||state.openingFlow?.route!==openingRoutes[state.selectedSchool]))throw Error('學校確認資料無效');
 return state;
}
export function loadPlayerState(storage=localStorage){const raw=storage.getItem(PLAYER_KEY);if(!raw)return null;const parsed=JSON.parse(raw);return parsed.version===4&&!parsed.phase?null:validatePlayerState(parsed);}
export function commitCreator(character,run,storage=localStorage){
 confirmCharacterData(character,run);
 if(!run?.id||!eligibleSchools(character,run).length)throw Error('角色或本局資料尚未完整');
 const existing=loadPlayerState(storage);
 if(existing){if(existing.runId!==run.id)throw Error('已有另一局已確認資料，請先載入該存檔');return existing;}
 const state={version:1,runId:run.id,phase:'school-selection',creatorResult:clone(character),run:clone(run),selectedSchool:null,openingFlow:null,schoolDesk:{order:eligibleSchools(character,run),readingSchool:null,scroll:{}}};
 state.creatorResult.confirmed=true;
 validatePlayerState(state);storage.setItem(PLAYER_KEY,JSON.stringify(state));return state;
}
export function saveSchoolDesk(state,desk,storage=localStorage){
 const persisted=loadPlayerState(storage);
 if(!persisted||persisted.runId!==state.runId)throw Error('本局存檔已變更，請重新載入');
 if(persisted.phase!=='school-selection')return persisted;
 state=persisted;
 const allowed=eligibleSchools(state.creatorResult,state.run);
 if(desk.order.length!==allowed.length||new Set(desk.order).size!==allowed.length||desk.order.some(id=>!allowed.includes(id))||desk.readingSchool&&!allowed.includes(desk.readingSchool))throw Error('文件狀態無效');
 const next={...state,schoolDesk:clone(desk)};validatePlayerState(next);storage.setItem(PLAYER_KEY,JSON.stringify(next));return next;
}
export function confirmSchool(state,id,storage=localStorage){
 const persisted=loadPlayerState(storage);
 if(!persisted||persisted.runId!==state.runId)throw Error('請先保存角色資料');
 if(persisted.phase==='school-confirmed'){if(persisted.selectedSchool!==id)throw Error('本局已確認另一所學校');return persisted;}
 if(!schoolEligibility(persisted.creatorResult,id,persisted.run).ok)throw Error('不符合該校入學資格');
 const next={...persisted,phase:'school-confirmed',selectedSchool:id,openingFlow:{route:openingRoutes[id],status:'pending',schoolId:id}};
 validatePlayerState(next);storage.setItem(PLAYER_KEY,JSON.stringify(next));return next;
}
export function exportPlayerState(state){return JSON.stringify(validatePlayerState(state),null,2);}
export function importPlayerState(json,storage=localStorage){const state=validatePlayerState(JSON.parse(json));storage.setItem(PLAYER_KEY,JSON.stringify(state));return state;}
