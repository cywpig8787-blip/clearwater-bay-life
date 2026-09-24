import {rules,attributes,academics,groups,sum} from './point-data.mjs?v=ledger-v3';
import {AllocationEngine,pointSources,integer as nonnegativeInteger} from './allocation-engine.mjs?v=ledger-v3';
export * from './point-data.mjs?v=ledger-v3';
export {AllocationEngine,pointSources};
// Compatibility readers for existing callers; all calculations live in the engine.
export const pointPools=character=>pointSources(character).map(s=>({...s,skills:[...s.eligibleSkills]}));
export function allocation(character,{pools,kinds}={}) {
  const ledger=new AllocationEngine(character,{...(pools?{sources:pools,restore:false}:{}),...(kinds?{kinds,restore:false}:{})}).ledger();
  return {...ledger,pools:ledger.sources};
}
export const skillBudget=(character,kind)=>{
  if(!['academic','skills'].includes(kind))throw new Error('未知技能分類。');
  return new AllocationEngine(character).summary(kind);
};
export function validateAllocation(character,skills,{pools=pointSources(character),kinds=['academic','skills']}={}) {
  const errors=[],spent=Object.fromEntries(pools.map(p=>[p.id,0])),seen=new Set();
  for(const skill of skills){
    const key=skill.kind+'|'+skill.name;
    const allowed=skill.kind==='academic'?academics:skill.kind==='skills'?Object.values(groups).flat():[];
    if(!kinds.includes(skill.kind)||!allowed.includes(skill.name)||seen.has(key)){errors.push('未知或重複技能：'+key);continue;}
    seen.add(key);
    const baseId=skill.kind==='academic'?'academic':'general';
    const contributions={...skill.attributeBonusContributions,[baseId]:skill.baseContribution};
    if(skill.sources){
      const listed={};
      for(const source of skill.sources){
        if(!nonnegativeInteger(source.points)||Object.hasOwn(listed,source.poolId))errors.push('重複或無效來源：'+skill.name);
        listed[source.poolId]=(listed[source.poolId]||0)+source.points;
      }
      for(const id of new Set([...Object.keys(listed),...Object.keys(contributions)]))if((listed[id]||0)!==(contributions[id]||0))errors.push('來源明細不一致：'+skill.name);
    }
    let paid=0;
    for(const [id,points] of Object.entries(contributions)){
      if(!nonnegativeInteger(points)){errors.push(key+' 的 '+id+' 投入必須是非負整數');continue;}
      if(!points)continue;
      const pool=pools.find(p=>p.id===id);
      if(!pool||!pool.eligibleSkills.includes(skill.name)){errors.push(id+' 不可支付 '+skill.name);continue;}
      spent[id]+=points;paid+=points;
    }
    if(paid!==(character[skill.kind]?.[skill.name]||0))errors.push(key+' 的投入缺少合法來源');
  }
  for(const kind of kinds)for(const [name,value] of Object.entries(character[kind]||{}))if(value&&!seen.has(kind+'|'+name))errors.push('缺少技能投入紀錄：'+name);
  for(const pool of pools)if(spent[pool.id]>pool.amount)errors.push(pool.id+' 投入 '+spent[pool.id]+' 超過額度 '+pool.amount);
  return {valid:errors.length===0,errors,spent};
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
  const ledger=allocation(character);
  errors.push(...validateAllocation(character,ledger.skills).errors);
  const {unfunded}=ledger;if(unfunded)errors.push(`技能配置有 ${unfunded} 點超出適用點數池；請降低技能或重新分配能力值。`);
  return errors;
}

export function setScore(character,kind,name,value) {
  const allowed=kind==='attr'?attributes:kind==='academic'?academics:kind==='skills'?Object.values(groups).flat():[];
  if(!allowed.includes(name)||!nonnegativeInteger(value))throw new Error('請輸入合法能力或技能的非負整數。');
  const old=character[kind]?.[name]||0;
  if(!character.dev){
    const cap=kind==='attr'?rules.attributeCap:rules.skillCap;
    if(value>cap)throw new Error('單項上限為 '+cap+'。');
    if(kind==='attr'&&value>old&&sum(character.attr)-old+value>rules.attributeTotal)throw new Error('能力值總可分配值為 250；請先降低其他能力值。');
  }
  const candidate={...character,[kind]:{...character[kind],[name]:value}};
  const engine=new AllocationEngine(candidate);
  if(kind!=='attr'&&value>old&&!validateAllocation(candidate,engine.ledger().skills).valid)throw new Error('適用點數不足；請先降低其他技能，或查看點數來源。');
  character[kind]=candidate[kind];
  character.creationPoints=engine.ledger();
}
export function randomizeScores(character,kind,names,rng=Math.random) {
  const allowed=kind==='attr'?attributes:kind==='academic'?academics:kind==='skills'?Object.values(groups).flat():[];
  if(!allowed.length||names.length!==allowed.length||new Set(names).size!==allowed.length||names.some(n=>!allowed.includes(n)))throw new Error('隨機配置必須包含此分類的完整技能清單。');
  if(kind==='attr'){
    const values=Object.fromEntries(attributes.map(id=>[id,0]));
    let remaining=rules.attributeTotal;
    while(remaining){
      const possible=attributes.filter(id=>values[id]<rules.attributeCap),sample=rng();
      if(!Number.isFinite(sample)||sample<0||sample>=1)throw new Error('無效隨機值。');
      const id=possible[Math.floor(sample*possible.length)],amount=Math.min(5,remaining,rules.attributeCap-values[id]);
      values[id]+=amount;remaining-=amount;
    }
    character.attr=values;new AllocationEngine(character).persist();return null;
  }
  const candidate={...character},engine=new AllocationEngine(candidate),summary=engine.summary(kind);
  candidate[kind]=engine.randomize(kind,names,rng);
  // The same payment ledger is persisted, not reconstructed by a second allocator.
  const ledger=engine.ledger();
  const selected=ledger.skills.filter(s=>s.kind===kind);
  const proof=validateAllocation(candidate,selected,{kinds:[kind]});
  if(!proof.valid)throw new Error(proof.errors.join(' '));
  character[kind]=candidate[kind];character.creationPoints=ledger;
  return summary;
}
export const canonicalGender = gender => ({男性:'male',女性:'female',中性:'neutral'})[gender]||gender;
export const residenceFields=['residentialAccess','residenceId','buildingId','floorId','roomId','bedId'];
export function creatorPlayer(character) {
  const player=structuredClone(character);
  // Recompute creation provenance; a saved snapshot never authorizes spending.
  // In-game growth does not spend these creation-only resources.
  player.creationPoints={attributes:{...character.attr},...new AllocationEngine(character).ledger()};
  player.basic.gender=canonicalGender(player.basic.gender);
  residenceFields.forEach(key=>delete player[key]);
  return player;
}
