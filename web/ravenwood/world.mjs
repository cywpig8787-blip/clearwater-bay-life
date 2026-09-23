// Distances follow the supplied 360 × 320 m campus plan. Interior distances
// are explicit, adjustable estimates within its building footprints (see README).
export const movement = { walkMps: 1.3, stairsMps: 0.65, elevatorMps: 1.5, elevatorWaitSeconds: 20 };
export const locations = {};
export const connections = [];
function location(id, name, description, extra = {}) {
  if (locations[id]) throw new Error(`Duplicate location: ${id}`);
  locations[id] = { id, name, description, actions: [], people: [], items: [], ...extra };
  return id;
}
function connect(from, to, distanceMeters, mode = 'walk', extra = {}) {
  connections.push({ id: `${from}~${to}`, from, to, distanceMeters, mode, ...extra });
}
function room(id, name, parent, meters = 8, extra = {}) {
  location(id, name, `${name}。開學前一週，這裡正準備迎接學生。`, extra);
  connect(parent, id, meters);
  return id;
}
const outside = [
  ['south-gate', '南門', [180,320], '穿過校門便是校園主步道；往南通向大型公園。'],
  ['south-path', '南側主步道', [180,286], '主步道沿大禮堂東側延伸，向北通往教學區。'],
  ['central-path', '中央步道南段', [180,228], '西面是主校舍前的步道，東面通往社團／實作棟。'],
  ['east-path', '主校舍東側步道', [218,184], '主校舍和生活中心之間的步道，向北通往科學翼與宿舍區。'],
  ['north-path', '北側橫向步道', [218,124], '田徑場南側的步道向東延伸至住宿區。'],
  ['west-south', '西側步道南段', [100,248], '音樂中心、大禮堂與主校舍之間的步道。'],
  ['west-path', '西側校園步道', [100,198], '沿主校舍西側行走，可以前往體育中心或戶外體育區。'],
  ['west-north', '西側步道北段', [100,124], '田徑場入口位於步道北邊，東邊通往宿舍區。'],
  ['courtyard', '教學中庭', [158,199], '主校舍圍繞著中庭；向北可以進入主校舍。'],
  ['dorm-path', '宿舍區步道', [272,124], '四棟宿舍分列住宿庭院兩側。'],
  ['dorm-court', '住宿庭院', [272,82], '08、09 在庭院北側，10、11 位於南側。'],
  ['park', '大型公園', [180,380], '校門南方的公園步道向商店街延伸。第一版僅開放通行。'],
  ['shopping-street', '商店街', [180,466], '公園外的商店街。這裡是第一版校外探索邊界，可以原路返回。']
];
for (const [id,name,position,description] of outside) location(id,name,description,{position,buildingId:'outdoors'});
function path(a,b,via=[]) {
  const points=[locations[a].position,...via,locations[b].position];
  const distance=points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0);
  connect(a,b,Math.round(distance*10)/10,'walk',{distanceBasis:'plan-polyline'});
}
path('south-gate','south-path'); path('south-path','central-path');
path('central-path','east-path',[[218,228]]); path('east-path','north-path');
path('central-path','west-south',[[100,228]]); path('west-south','west-path'); path('west-path','west-north');
path('west-north','north-path'); path('north-path','dorm-path'); path('dorm-path','dorm-court');
path('central-path','courtyard',[[158,228]]); path('courtyard','east-path',[[204,199],[204,184]]);
path('south-gate','park'); path('park','shopping-street');
function entrance(id,name,position,from,via=[]) {
  location(id,name,`${name}，可以進入建築或返回校園步道。`,{position}); path(from,id,via);
}
entrance('main-entry','01 主校舍入口',[158,170],'courtyard');
entrance('life-entry','02 生活中心入口',[240,168],'east-path',[[218,168]]);
entrance('club-entry','03 社團／實作棟入口',[240,234],'central-path',[[218,228],[218,234]]);
entrance('music-entry','04 音樂中心入口',[92,269],'west-south',[[104,248],[104,269]]);
entrance('auditorium-entry','05 大禮堂入口',[142,300],'south-path',[[180,308],[142,308]]);
entrance('sports-entry','06 體育中心入口',[84,167],'west-path',[[100,167]]);
entrance('athletics-entry','07 戶外體育區入口',[106,120],'west-north',[[106,124]]);
// Main building: ordered classroom doors along one corridor, stairs at both ends.
for(let f=1;f<=5;f++) {
  const base=`main-${f}`, grade=6-f;
  location(`${base}-hall`, `主校舍 ${f}F 走廊`,f===1?'行政與教職員辦公區沿走廊排列。':`${grade}年級的四間教室依序排列，置物櫃沿走廊設置。`,{buildingId:'01',floor:f});
  for(const side of ['left','right']) {
    room(`${base}-${side}-stairs`,`${f}F ${side==='left'?'左':'右'}側樓梯`,`${base}-hall`,38,{buildingId:'01',floor:f});
    room(`${base}-${side}-toilet`,`${f}F ${side==='left'?'左':'右'}側廁所`,`${base}-${side}-stairs`,4,{buildingId:'01',floor:f});
    if(f>1)connect(`main-${f-1}-${side}-stairs`,`${base}-${side}-stairs`,8,'stairs');
  }
  room(`${base}-lift`,`${f}F 右側電梯前廳`,`${base}-right-stairs`,3,{buildingId:'01',floor:f});
  for(let lower=1;lower<f;lower++)connect(`main-${lower}-lift`,`${base}-lift`,(f-lower)*3.6,'elevator');
  if(f===1) {
    connect('main-entry',`${base}-hall`,10);
    for(const [id,name,d] of [['admin','行政中心',12],['teachers','教師辦公室',22],['health','保健室',16],['stationery','迷你文具店',8]])room(id,name,`${base}-hall`,d,{buildingId:'01',floor:1});
  } else {
    for(let n=1;n<=4;n++)room(`${base}-class-${n}`,`${grade}年${n}班`,`${base}-hall`,Math.abs((n-1)*18-27)+5,{buildingId:'01',floor:f,seats:30,grade,classNumber:n});
    locations[`${base}-hall`].items=[{id:`locker-${f}`,name:`${f}F 其他學生置物櫃`,kind:'locker'}];
    if(f===5)locations[`${base}-hall`].items.unshift({id:'own-locker',name:'自己的置物櫃（一年二班附近）',kind:'own-locker'});
  }
}
function floors(prefix,name,count,entry,buildingId) {
  for(let f=1;f<=count;f++) {
    const extra={buildingId,floor:f};
    location(`${prefix}-${f}-hall`,`${name} ${f}F 前廳`,`${name}的${f}樓，房間與垂直交通由此前往。`,extra);
    room(`${prefix}-${f}-stairs`,`${name} ${f}F 樓梯`,`${prefix}-${f}-hall`,5,extra);
    room(`${prefix}-${f}-lift`,`${name} ${f}F 電梯`,`${prefix}-${f}-hall`,4,extra);
    if(f>1)connect(`${prefix}-${f-1}-stairs`,`${prefix}-${f}-stairs`,8,'stairs');
    for(let lower=1;lower<f;lower++)connect(`${prefix}-${lower}-lift`,`${prefix}-${f}-lift`,(f-lower)*3.6,'elevator');
  }
  if(entry)connect(entry,`${prefix}-1-hall`,6);
}
function rooms(prefix,f,list,buildingId) {
  list.forEach(([id,name,extra={}],i)=>room(id,name,`${prefix}-${f}-hall`,6+i*5,{buildingId,floor:f,...extra}));
}
floors('science','科學翼',3,null,'science');
for(let f=1;f<=3;f++) {
  connect(`main-${f}-hall`,`science-${f}-hall`,24,'walk',{kind:'attached-wing'});
  room(`science-${f}-escape`,`科學翼 ${f}F 另一端樓梯`,`science-${f}-hall`,30,{buildingId:'science',floor:f});
  if(f>1)connect(`science-${f-1}-escape`,`science-${f}-escape`,8,'stairs');
}
rooms('science',1,[['biology','生物實驗室'],['environment','地球／環境科學實驗室'],['greenhouse','溫室接口']],'science');
rooms('science',2,[['chemistry','化學實驗室'],['marine','海洋科學實驗室']],'science');
rooms('science',3,[['physics','物理實驗室']],'science');
entrance('science-entry','科學翼室外入口',[184,142],'north-path',[[218,142]]);
connect('science-entry','science-1-hall',6); connect('science-entry','greenhouse',12);
floors('life','生活中心',3,'life-entry','02');
rooms('life',1,[['dining','國際食堂']],'02');
rooms('life',2,[['fitness','中型健身室'],...['A','B','C'].map(n=>[`life-meeting-${n}`,`共享會議室 ${n}`,{reservationRequired:true}]),['life-lounge','小型公共休息區']],'02');
rooms('life',3,[['library','圖書館']],'02');
floors('club','社團／實作棟',3,'club-entry','03');
rooms('club',1,[['home-economics','家政廚房'],['practical','生活實作教室']],'03');
rooms('club',2,[['maker','Maker 創客空間'],['computer-a','電腦教室 A'],['computer-b','電腦教室 B']],'03');
rooms('club',3,[...['A','B','C','D'].map(n=>[`club-room-${n}`,`共享社團室 ${n}`]),['club-storage','社團儲藏室']],'03');
floors('music','音樂中心',3,'music-entry','04');
rooms('music',1,[['ensemble','大型排練室'],['band','樂隊排練室'],['instruments','樂器儲藏室']],'04');
rooms('music',2,[['solo-practice','個人練習室'],['group-practice','小組練習室']],'04');
rooms('music',3,[['recording','錄音室'],['music-control','錄音控制室'],['audio-production','音訊製作室']],'04');
room('auditorium-lobby','大禮堂大廳','auditorium-entry',6,{buildingId:'05'});
room('audience','觀眾席','auditorium-lobby',15,{buildingId:'05'});
room('stage','舞台','audience',28,{buildingId:'05'});
room('backstage','後台','stage',10,{buildingId:'05'});
for(const [id,name] of [['green-room','演出者休息室'],['preparation','更衣／準備室'],['stage-equipment','設備儲藏室'],['stage-control','燈光／音響控制室']])room(id,name,'backstage',8,{buildingId:'05'});
room('auditorium-left-toilet','禮堂左側廁所','auditorium-lobby',8);
room('auditorium-right-toilet','禮堂右側廁所','auditorium-lobby',8);
entrance('backstage-door','大禮堂後台側門',[142,260],'west-south',[[142,248]]);
connect('backstage','backstage-door',5);path('music-entry','backstage-door',[[104,269],[104,248],[142,248]]);
floors('sports','體育中心',2,'sports-entry','06');
rooms('sports',1,[['gym','室內體育館'],['changing','更衣／淋浴區'],['sports-equipment','體育器材室'],['pool-entry','游泳池入口']],'06');
room('pool-changing','泳池更衣區','pool-entry',6,{buildingId:'06',floor:1});
room('pool','游泳池','pool-changing',12,{buildingId:'06',floor:1});
rooms('sports',2,[['table-tennis','桌球區'],['training','小型訓練空間'],['stands','上層看台']],'06');
entrance('sports-back','體育中心後側出口',[84,152],'west-north',[[100,124],[100,152]]);
connect('sports-1-hall','sports-back',18);path('sports-back','athletics-entry',[[100,152],[100,124],[106,124]]);
room('track','田徑／美式足球場','athletics-entry',20,{buildingId:'07',trackLapMeters:400});
room('tennis','網球場','athletics-entry',45,{buildingId:'07'});
room('outdoor-activity','泛用戶外活動區','athletics-entry',35,{buildingId:'07'});

// User-confirmed building sides: 08/10 male, 09/11 female.
export const dormitories = [
  {id:'08',side:'male_side',position:[248,52],pair:'08-09'},
  {id:'09',side:'female_side',position:[296,52],pair:'08-09'},
  {id:'10',side:'male_side',position:[248,112],pair:'10-11'},
  {id:'11',side:'female_side',position:[296,112],pair:'10-11'}
];
for(const dorm of dormitories) {
  const p=`dorm-${dorm.id}`, label=`${dorm.id} 宿舍`, restriction={residentialAccess:dorm.side,buildingId:dorm.id};
  entrance(`${p}-entry`,`${label}入口`,dorm.position,'dorm-court',[[272,dorm.position[1]+12],[dorm.position[0],dorm.position[1]+12]]);
  room(`${p}-lobby`,`${label}公共大廳`,`${p}-entry`,5,{buildingId:dorm.id,floor:1});
  for(const [id,name] of [['supervisor','宿管櫃台'],['packages','包裹區'],['vending','販賣機區'],['lounge','公共交誼廳']])room(`${p}-${id}`,`${label} ${name}`,`${p}-lobby`,6,{buildingId:dorm.id,floor:1});
  room(`${p}-kitchen`,`${label} 公共廚房`,`${p}-lounge`,5,{buildingId:dorm.id,floor:1});
  // The gate is BEFORE both stairs and elevator. Every residential destination
  // also carries its restriction, so neither vertical route can bypass it.
  floors(p,label,9,null,dorm.id);
  connect(`${p}-lobby`,`${p}-1-hall`,5,'walk',{kind:'access-gate'});
  for(let f=1;f<=9;f++) {
    for(const suffix of ['hall','stairs','lift'])Object.assign(locations[`${p}-${f}-${suffix}`],restriction);
    if(f===1)continue;
    if(f===3) {
      rooms(p,f,[['laundry','洗衣房'],['fitness','健身房'],['meeting','預約會議室']].map(([id,name])=>[`${p}-${id}`,`${label} ${name}`,{...restriction,reservationRequired:id==='meeting'}]),dorm.id);
    } else {
      const count=f<=6?6:7, beds=f<=6?2:1;
      for(let n=1;n<=count;n++)room(`${p}-${f}-room-${n}`,`${label} ${f}0${n}（${beds===2?'雙':'單'}人房）`,`${p}-${f}-hall`,5+(n-1)*3,{...restriction,floor:f,beds,items:[{id:'bed',name:'床',kind:'interface'},{id:'desk',name:'書桌',kind:'interface'},{id:'wardrobe',name:'衣櫃',kind:'interface'}]});
      for(const [id,name] of [['toilet','公共廁所'],['shower','公共淋浴'],['water','飲水區']])room(`${p}-${f}-${id}`,`${label} ${f}F ${name}`,`${p}-${f}-hall`,6,{...restriction,floor:f});
    }
  }
}
for(const pair of ['08-09','10-11']) {
  const id=`shared-${pair}`;
  location(id,`${pair} 3F 共享公共區`,'兩側學生可以在這裡碰面；返回住宅側時仍需刷卡。',{floor:3,allowedBuildings:pair.split('-')});
  for(const building of pair.split('-'))connect(`dorm-${building}-3-hall`,id,12,'walk',{kind:'access-gate'});
}

export function travelSeconds(connection) {
  const speed=connection.mode==='stairs'?movement.stairsMps:connection.mode==='elevator'?movement.elevatorMps:movement.walkMps;
  return Math.max(1,Math.ceil(connection.distanceMeters/speed+(connection.mode==='elevator'?movement.elevatorWaitSeconds:0)));
}
export function exits(id) {
  return connections.filter(c=>c.from===id||c.to===id).map(c=>({...c,to:c.from===id?c.to:c.from,from:id}));
}
