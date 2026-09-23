import {locations,exits,travelSeconds,dormitories} from './world.mjs';
export const WORLD_KEY='clearwater-life-ravenwood-v1';
export const PLAYER_KEY='clearwater-life-player-state-v1';
export const checkConfig={baseChance:25,skillWeight:1,minChance:5,maxChance:95,seconds:120};
export function residentialSide(gender,choice) {
  if(['男性','male'].includes(gender))return 'male_side';
  if(['女性','female'].includes(gender))return 'female_side';
  return ['中性','neutral'].includes(gender)&&['male_side','female_side'].includes(choice)?choice:null;
}
export function assignResidence(character) {
  const side=residentialSide(character.basic?.gender,character.residentialAccess);
  if(!side)throw new Error('請在住宿階段選擇男側或女側。');
  const available=dormitories.filter(d=>d.side===side);
  const buildingId=available.some(d=>d.id===character.buildingId)?character.buildingId:available[0].id;
  const roomId=`dorm-${buildingId}-2-room-1`;
  return {residentialAccess:side,residenceId:`dorm-${buildingId}`,buildingId,floorId:`dorm-${buildingId}-2`,roomId,bedId:`${roomId}-bed-1`};
}
export function completeResidenceAssignment(state,choice) {
  if(state.locationId!=='admin')throw new Error('請到主校舍 1F 行政中心辦理住宿分配。');
  if(state.player.residentialAccess)throw new Error('住宿已分配完成。');
  // Only this world interaction assigns access; ignore creator-era residence fields.
  const residence=assignResidence({basic:{gender:state.player.gender},residentialAccess:choice});
  Object.assign(state.player,residence);
  state.residenceAssignment='assigned';
  return record(state,`住宿分配完成：${residence.buildingId} 棟、2F、201 雙人房、床位 1。學生證已開通對應住宿門禁。`);
}
export function newWorld(character,characterId) {
  if(character.school!=='coed')throw new Error('第一版校園測試僅開放 Ravenwood。');
  return {version:1,characterId,residenceAssignment:'pending',locationId:'south-gate',elapsedSeconds:0,startTime:'2026-08-25T09:00:00',openingDate:'2026-09-01',
    player:{name:character.basic.name||'未命名角色',gender:character.basic.gender,skills:{...character.skills},portraitId:'placeholder-v01'},
    openedLockers:[],reservations:[],discoveredCount:0,log:['開學前一週，你抵達雷文伍德高中南門。請到主校舍 1F 行政中心辦理住宿分配。'],showChecks:false};
}
export function validateWorld(state,characterId) {
  const pending=state?.residenceAssignment==='pending'&&Boolean(state.player)&&
    ['男性','女性','中性','male','female','neutral'].includes(state.player.gender)&&
    ['residentialAccess','residenceId','buildingId','floorId','roomId','bedId'].every(key=>state.player[key]==null);
  const assigned=dormitories.some(d=>d.id===state?.player?.buildingId&&d.side===state?.player?.residentialAccess)&&
    residentialSide(state.player.gender,state.player.residentialAccess)===state.player.residentialAccess&&
    state.player.roomId===`dorm-${state.player.buildingId}-2-room-1`;
  return state?.version===1&&state.characterId===characterId&&Boolean(locations[state.locationId])&&
    Number.isFinite(state.elapsedSeconds)&&state.elapsedSeconds>=0&&
    (pending||assigned)&&
    Array.isArray(state.openedLockers)&&Array.isArray(state.reservations)&&Array.isArray(state.log)&&
    accessReason(state,state.locationId)==='';
}
export function accessReason(state,destination) {
  const target=locations[destination];
  if(!target)return '地點不存在。';
  if(target.residentialAccess&&target.residentialAccess!==state.player.residentialAccess)return '學生證沒有此住宿側的權限。';
  if(target.residentialAccess&&target.buildingId!==state.player.buildingId)return '學生證沒有此宿舍樓的住宅權限。';
  if(target.allowedBuildings&&!target.allowedBuildings.includes(state.player.buildingId))return '此共享區供該組宿舍學生使用。';
  if(target.reservationRequired&&!state.reservations.includes(destination))return '需先在門外預約使用。';
  return '';
}
function record(state,message) {state.log=[message,...state.log].slice(0,12);return message;}
export function move(state,destination) {
  const connection=exits(state.locationId).find(c=>c.to===destination);
  if(!connection)throw new Error('沒有直接相通的路線。');
  const reason=accessReason(state,destination);
  if(reason)throw new Error(reason);
  const seconds=travelSeconds(connection);
  state.locationId=destination;state.elapsedSeconds+=seconds;
  record(state,`你來到${locations[destination].name}。行程 ${seconds} 秒。`);
  return seconds;
}
export function reserve(state,destination) {
  if(!exits(state.locationId).some(c=>c.to===destination)||!locations[destination].reservationRequired)throw new Error('請先走到會議室門外。');
  if(state.reservations.includes(destination))return;
  state.reservations.push(destination);
  record(state,`已預約${locations[destination].name}，本次校園測試期間可進入。`);
}
export function openLocker(state,id,rng=Math.random) {
  const item=locations[state.locationId].items.find(i=>i.id===id);
  if(!item||!['locker','own-locker'].includes(item.kind))throw new Error('這裡沒有該置物櫃。');
  if(item.kind==='own-locker'||state.openedLockers.includes(id)) {
    if(!state.openedLockers.includes(id))state.openedLockers.push(id);
    return {success:true,message:record(state,`你打開${item.name}。物品存取接口已開啟，目前沒有可拿取的物品。`)};
  }
  const skill=Math.max(0,Math.min(75,Number(state.player.skills['妙手'])||0));
  const chance=Math.max(checkConfig.minChance,Math.min(checkConfig.maxChance,checkConfig.baseChance+skill*checkConfig.skillWeight));
  const roll=1+Math.floor(rng()*100),success=roll<=chance;
  state.elapsedSeconds+=checkConfig.seconds;
  if(success)state.openedLockers.push(id);else state.discoveredCount++;
  const message=record(state,success?'你打開了置物櫃。物品存取接口已開啟。經過 2 分鐘。':'「你在做什麼？」你被發現了，停下手上的動作。經過 2 分鐘。');
  return {success,skill,chance,roll,seconds:checkConfig.seconds,message};
}
export function clock(state) {
  // Explicit UTC arithmetic avoids local timezone/DST changing game time.
  const date=new Date(Date.UTC(2026,7,25,9)+state.elapsedSeconds*1000);
  return {date:date.toISOString().slice(0,10),time:date.toISOString().slice(11,19),daysUntilOpening:Math.ceil((Date.UTC(2026,8,1)-Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()))/86400000)};
}
