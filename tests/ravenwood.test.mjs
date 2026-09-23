import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {locations,connections,exits,travelSeconds,dormitories} from '../web/ravenwood/world.mjs';
import {newWorld,move,accessReason,assignResidence,residentialSide,openLocker,reserve,clock,validateWorld} from '../web/ravenwood/engine.mjs';
const character=(gender='男性',side)=>({basic:{name:'測試玩家',gender},school:'coed',skills:{'妙手':42},residentialAccess:side});
function route(state,to){
 const queue=[[state.locationId]],seen=new Set(queue[0]);
 while(queue.length){const r=queue.shift(),last=r.at(-1);if(last===to)return r;
  for(const c of exits(last))if(!seen.has(c.to)&&!accessReason(state,c.to)){seen.add(c.to);queue.push([...r,c.to]);}
 }
 return null;
}
function walk(state,to){const r=route(state,to);assert.ok(r,`Route to ${to}`);for(const id of r.slice(1))move(state,id);}
test('browser entry modules parse as ES modules',()=>{
 for(const path of ['../web/opening/app.js','../web/ravenwood/app.mjs']){
  const result=spawnSync(process.execPath,['--input-type=module','--check'],{input:readFileSync(new URL(path,import.meta.url),'utf8'),encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
 }
});
test('graph has valid unique reversible connections and physical durations',()=>{
 const ids=new Set();
 for(const c of connections){assert.ok(locations[c.from]);assert.ok(locations[c.to]);assert.notEqual(c.from,c.to);assert.ok(c.distanceMeters>0);assert.ok(!ids.has(c.id));ids.add(c.id);assert.ok(travelSeconds(c)>0);assert.ok(exits(c.to).some(e=>e.to===c.from));}
 assert.equal(travelSeconds({mode:'walk',distanceMeters:130}),100);
 assert.equal(travelSeconds({mode:'stairs',distanceMeters:13}),20);
 assert.equal(travelSeconds({mode:'elevator',distanceMeters:6}),24);
});
test('main school floors, ordered classes and attached science floors match specification',()=>{
 for(let f=2;f<=5;f++){
  const classes=Object.values(locations).filter(l=>l.buildingId==='01'&&l.floor===f&&l.seats);
  assert.equal(classes.length,4);assert.equal(classes.reduce((n,l)=>n+l.seats,0),120);assert.ok(classes.every(l=>l.grade===6-f));
  assert.ok(locations[`main-${f}-hall`].items.some(i=>i.kind==='locker'));
 }
 for(let f=1;f<=5;f++)for(const side of ['left','right']){assert.ok(locations[`main-${f}-${side}-stairs`]);assert.ok(locations[`main-${f}-${side}-toilet`]);}
 for(let f=1;f<=3;f++)assert.ok(exits(`main-${f}-hall`).some(c=>c.to===`science-${f}-hall`&&c.kind==='attached-wing'));
 assert.ok(!connections.some(c=>c.from.startsWith('main-')&&c.to.startsWith('life-')),'No skybridge');
});
test('dorm templates contain exactly 6 double / 7 single rooms per residential floor',()=>{
 for(const d of dormitories)for(let f=1;f<=9;f++){
  const rooms=Object.values(locations).filter(l=>l.buildingId===d.id&&l.floor===f&&l.beds);
  assert.equal(rooms.length,[1,3].includes(f)?0:f<=6?6:7);
  assert.ok(rooms.every(l=>l.beds===(f<=6?2:1)));
 }
});
test('male/female fixed, neutral explicitly chooses; no stale opposite assignment',()=>{
 assert.equal(residentialSide('男性','female_side'),'male_side');assert.equal(residentialSide('女性','male_side'),'female_side');
 assert.equal(residentialSide('中性',null),null);assert.throws(()=>assignResidence(character('中性')));
 for(const side of ['male_side','female_side'])assert.equal(assignResidence(character('中性',side)).residentialAccess,side);
 assert.equal(assignResidence({...character('女性'),buildingId:'08'}).buildingId,'09');
 assert.throws(()=>newWorld({...character(),school:'girls'},'test'));
});
test('all permitted locations reachable and every route can return to south gate for all four buildings',()=>{
 for(const d of dormitories){
  const state=newWorld({...character('中性',d.side),buildingId:d.id},d.id);
  // Reservation is a deliberate interaction gate, not a broken connection.
  state.reservations=Object.values(locations).filter(l=>l.reservationRequired).map(l=>l.id);
  const reachable=Object.keys(locations).filter(id=>route(state,id));
  for(const id of Object.keys(locations)){
   if(!accessReason(state,id))assert.ok(reachable.includes(id),`${d.id} cannot reach ${id}`);
   else assert.ok(!reachable.includes(id),`${d.id} bypassed ${id}`);
  }
  for(const id of reachable){state.locationId=id;assert.ok(route(state,'south-gate'),`No return from ${id}`);}
 }
});
test('main routes advance clock and survive JSON save/load',()=>{
 const state=newWorld(character(),'a');
 for(const id of ['main-5-class-2','chemistry','dining','library','maker','recording','backstage','pool','track','shopping-street',state.player.roomId,'south-gate'])walk(state,id);
 assert.ok(state.elapsedSeconds>0);
 const copy=JSON.parse(JSON.stringify(state));assert.ok(validateWorld(copy,'a'));assert.equal(validateWorld(copy,'different'),false);
 assert.equal(clock(copy).time,clock(state).time);
 state.elapsedSeconds=16*3600;assert.equal(clock(state).date,'2026-08-26');assert.equal(clock(state).time,'01:00:00');
});
test('both shared spaces reject opposite side and other building, with no time penalty',()=>{
 for(const d of dormitories){
  const state=newWorld({...character('中性',d.side),buildingId:d.id},d.id);
  walk(state,`shared-${d.pair}`);
  const other=d.pair.split('-').find(id=>id!==d.id),before=state.elapsedSeconds;
  assert.throws(()=>move(state,`dorm-${other}-3-hall`));assert.equal(state.elapsedSeconds,before);
  walk(state,state.player.roomId);walk(state,'south-gate');
  for(const target of dormitories.filter(x=>x.id!==d.id)){
   walk(state,`dorm-${target.id}-lobby`);assert.throws(()=>move(state,`dorm-${target.id}-1-hall`));
  }
 }
});
test('reservation from door unlocks room; cannot reserve remotely',()=>{
 const state=newWorld(character(),'a');assert.throws(()=>reserve(state,'life-meeting-A'));
 walk(state,'life-2-hall');assert.throws(()=>move(state,'life-meeting-A'));
 reserve(state,'life-meeting-A');move(state,'life-meeting-A');move(state,'life-2-hall');
});
test('locker attempt works only locally; success opens access, failure is discovered; both cost 120 sec',()=>{
 const state=newWorld(character(),'a');assert.throws(()=>openLocker(state,'locker-5'));
 walk(state,'main-5-hall');let before=state.elapsedSeconds;
 assert.ok(openLocker(state,'own-locker').success);assert.equal(state.elapsedSeconds,before);
 const fail=openLocker(state,'locker-5',()=>.99);assert.equal(fail.success,false);assert.equal(state.discoveredCount,1);assert.equal(state.elapsedSeconds,before+120);assert.ok(!state.openedLockers.includes('locker-5'));
 const success=openLocker(state,'locker-5',()=>0);assert.equal(success.success,true);assert.equal(state.elapsedSeconds,before+240);assert.ok(state.openedLockers.includes('locker-5'));
 openLocker(state,'locker-5',()=>.99);assert.equal(state.elapsedSeconds,before+240);
 assert.throws(()=>move(state,'shopping-street'));assert.equal(state.locationId,'main-5-hall');
});
