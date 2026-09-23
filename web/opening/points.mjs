// CYW-51 Point Pools v0.1; eligible skills confirmed by the user on 2026-09-23.
export const rules = Object.freeze({attributeTotal:250,attributeCap:65,baseline:50,academicBase:200,generalBase:200,skillCap:75});
export const attributes = ['STR','CON','AGI','DEX','PER','INT'];
export const academics = ['語文','English','Spanish','French','Japanese','Mandarin Chinese','數學','物理','化學','生物','歷史','地理','政治／公民','經濟','法律','心理'];
export const groups = {
  '視覺藝術與設計':['繪畫','雕塑／立體造型','攝影','設計'],
  '音樂與表演':['音樂','表演','舞蹈'],
  '媒體製作':['影像製作','音訊製作'],
  '資訊與數位技術':['電腦','程式設計','資料分析'],
  '工程、製作與修繕':['工程','電子','機械','修理','木工','縫紉','手工藝'],
  '生活與實用':['烹飪','家務','園藝','急救','生存','駕駛'],
  '體育與身體技術':['跑步','游泳','自行車','滑行','籃球','足球','排球','棒球／壘球','網球','羽毛球','拳擊','跆拳道','空手道','柔道','體操','滑雪'],
  '溝通與社會互動':['演說','辯論','交涉','欺瞞','洞察'],
  '世界玩法':['潛行','妙手']
};
export const bonusSkills = {
  STR:['拳擊','跆拳道','空手道','柔道'],
  CON:['跑步','游泳','自行車','生存'],
  AGI:[...groups['體育與身體技術'],'表演','舞蹈'],
  DEX:[...groups['工程、製作與修繕'],'繪畫','雕塑／立體造型','妙手'],
  PER:['攝影','洞察','急救'],
  INT:[...academics,...groups['資訊與數位技術']]
};
export const sum = obj => Object.values(obj||{}).reduce((a,b)=>a+(Number(b)||0),0);
export const bonus = value => Math.max(0,Number(value||0)-rules.baseline);
const nonnegativeInteger = value => Number.isSafeInteger(value)&&value>=0;
export function pointPools(character) {
  return [
    {id:'academic',label:'Academic Base Points',amount:rules.academicBase,skills:academics},
    {id:'general',label:'General Skill Points',amount:rules.generalBase,skills:Object.values(groups).flat()},
    ...attributes.map(id=>({id,label:`${id} Bonus`,amount:bonus(character.attr?.[id]),skills:bonusSkills[id]}))
  ];
}
// A residual flow graph can re-route previously allocated points when eligible
// sources overlap (e.g. INT shared by academics and programming). Each source
// has one capacity, so categories can never duplicate an attribute's bonus.
export function allocation(character,{pools=pointPools(character),kinds=['academic','skills']}={}) {
  const demands=[...academics.map(name=>({name,kind:'academic'})),...Object.values(groups).flat().map(name=>({name,kind:'skills'}))].filter(skill=>kinds.includes(skill.kind));
  const source=0,firstPool=1,firstSkill=firstPool+pools.length,sink=firstSkill+demands.length;
  const graph=Array.from({length:sink+1},()=>[]);
  function edge(from,to,capacity){const forward={to,remaining:capacity,capacity,reverse:graph[to].length};const back={to:from,remaining:0,capacity:0,reverse:graph[from].length};graph[from].push(forward);graph[to].push(back);return forward;}
  const links=pools.map((pool,p)=>({pool,capacity:edge(source,firstPool+p,pool.amount),skills:demands.flatMap((skill,d)=>pool.skills.includes(skill.name)?[{name:skill.name,edge:edge(firstPool+p,firstSkill+d,Number.MAX_SAFE_INTEGER)}]:[])}));
  const requests=demands.map((skill,d)=>({...skill,edge:edge(firstSkill+d,sink,Math.max(0,Number(character[skill.kind]?.[skill.name])||0))}));
  let used=0;
  while(true){
    const previous=Array(graph.length).fill(null),queue=[source];previous[source]={};
    for(let q=0;q<queue.length&&!previous[sink];q++)for(const link of graph[queue[q]])if(link.remaining>0&&!previous[link.to]){previous[link.to]={from:queue[q],link};queue.push(link.to);}
    if(!previous[sink])break;
    let amount=Infinity;
    for(let at=sink;at!==source;at=previous[at].from)amount=Math.min(amount,previous[at].link.remaining);
    for(let at=sink;at!==source;at=previous[at].from){const {from,link}=previous[at];link.remaining-=amount;graph[at][link.reverse].remaining+=amount;}
    used+=amount;
  }
  return {used,unfunded:requests.reduce((n,r)=>n+r.edge.remaining,0),pools:links.map(({pool,capacity,skills})=>({...pool,used:capacity.capacity-capacity.remaining,remaining:capacity.remaining,allocations:skills.filter(x=>x.edge.capacity-x.edge.remaining>0).map(x=>({name:x.name,points:x.edge.capacity-x.edge.remaining}))}))};
}
export function skillBudget(character,kind) {
  if(!['academic','skills'].includes(kind))throw new Error('未知技能池。');
  const names=kind==='academic'?academics:Object.values(groups).flat(),other=kind==='academic'?'skills':'academic';
  // Reserve only the sources needed by the unchanged pool, even if that old
  // draft is over budget. Its validation errors must not block this pool's roll.
  const reserved=allocation(character,{kinds:[other]});
  const sources=reserved.pools.filter(pool=>pool.skills.some(name=>names.includes(name))).map(pool=>({
    ...pool,generated:pool.amount,reserved:pool.used,amount:pool.remaining,
    skills:pool.skills.filter(name=>names.includes(name))
  }));
  const base=sources.filter(p=>!attributes.includes(p.id)).reduce((n,p)=>n+p.amount,0);
  const extra=sources.filter(p=>attributes.includes(p.id)).reduce((n,p)=>n+p.amount,0);
  const total=base+extra,allocated=sum(character[kind]);
  return {kind,base,bonus:extra,total,allocated,remaining:total-allocated,sources};
}
export function validateCharacter(character,{complete=false,normal=false}={}) {
  const errors=[],dev=character.dev&&!normal;
  for(const id of attributes){const value=character.attr?.[id];if(!nonnegativeInteger(value))errors.push(`${id} 必須是非負整數。`);else if(!dev&&value>rules.attributeCap)errors.push(`${id} 一般創角上限為 ${rules.attributeCap}。`);}
  const total=attributes.reduce((n,id)=>n+(Number(character.attr?.[id])||0),0);
  if(!dev&&total>rules.attributeTotal)errors.push(`能力值總值不得超過 ${rules.attributeTotal}。`);
  if(!dev&&complete&&total<rules.attributeTotal)errors.push(`能力值尚有 ${rules.attributeTotal-total} 點未分配。`);
  for(const kind of ['academic','skills'])for(const [name,value] of Object.entries(character[kind]||{})){
    if(!(kind==='academic'?academics:Object.values(groups).flat()).includes(name))errors.push(`未知技能：${name}。`);
    else if(!nonnegativeInteger(value)||(!dev&&value>rules.skillCap))errors.push(`${name} 必須是 0–${dev?'安全整數':rules.skillCap} 的整數。`);
  }
  if(!dev){const {unfunded}=allocation(character);if(unfunded)errors.push(`技能配置有 ${unfunded} 點超出適用點數池；請降低技能或重新分配能力值。`);}
  return errors;
}
export function setScore(character,kind,name,value) {
  if(!['attr','academic','skills'].includes(kind))throw new Error('未知配點種類。');
  if(!(kind==='attr'?attributes:kind==='academic'?academics:Object.values(groups).flat()).includes(name))throw new Error('未知能力或技能。');
  if(!nonnegativeInteger(value))throw new Error('請輸入非負整數。');
  const old=character[kind][name]||0;
  if(!character.dev){
    const cap=kind==='attr'?rules.attributeCap:rules.skillCap;
    if(value>cap)throw new Error(`單項上限為 ${cap}。`);
    if(kind==='attr'&&value>old&&sum(character.attr)-old+value>rules.attributeTotal)throw new Error('能力值總可分配值為 250；請先降低其他能力值。');
    // Decreases always remain possible, including repairs to older saved drafts.
    if(kind!=='attr'&&value>old){
      const budget=skillBudget(character,kind);
      if(allocation({...character,[kind]:{...character[kind],[name]:value}},{pools:budget.sources,kinds:[kind]}).unfunded)throw new Error('適用點數不足；請先降低其他技能，或查看點數來源。');
    }
  }
  character[kind][name]=value;
}
export function randomizeScores(character,kind,names,rng=Math.random) {
  const cap=kind==='attr'?rules.attributeCap:rules.skillCap;
  const allowed=kind==='attr'?attributes:kind==='academic'?academics:kind==='skills'?Object.values(groups).flat():[];
  if(!allowed.length||names.some(name=>!allowed.includes(name)))throw new Error('未知配點種類或技能。');
  // Calculate the budget BEFORE sampling. Spend restricted bonuses first,
  // leaving the flexible base for any remaining skills. No combined 400+ pool.
  const budget=kind==='attr'?null:skillBudget(character,kind);
  const sources=budget?[...budget.sources].sort((a,b)=>a.skills.length-b.skills.length):[{amount:rules.attributeTotal,skills:names}];
  const rolled=Object.fromEntries(names.map(name=>[name,0]));
  for(const source of sources){
    let remaining=source.amount;
    while(remaining>0){
      const possible=source.skills.filter(name=>names.includes(name)&&rolled[name]<cap);
      if(!possible.length)break;
      const name=possible[Math.min(possible.length-1,Math.floor(rng()*possible.length))];
      const amount=Math.min(5,remaining,cap-rolled[name]);
      rolled[name]+=amount;remaining-=amount;
    }
  }
  if(budget&&(sum(rolled)>budget.total||allocation({...character,[kind]:rolled},{pools:budget.sources,kinds:[kind]}).unfunded))throw new Error('隨機配置超出合法預算，原配置已保留。');
  character[kind]=rolled;
  return budget;
}
export const canonicalGender = gender => ({男性:'male',女性:'female',中性:'neutral'})[gender]||gender;
export const residenceFields=['residentialAccess','residenceId','buildingId','floorId','roomId','bedId'];
export function creatorPlayer(character) {
  const player=structuredClone(character);
  player.basic.gender=canonicalGender(player.basic.gender);
  residenceFields.forEach(key=>delete player[key]);
  return player;
}
