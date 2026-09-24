import {rules,attributes,academics,groups,bonusSkills,bonus} from './point-data.mjs?v=ledger-v3';

export const skillDefinitions=[...academics.map(name=>({name,kind:'academic'})),...Object.values(groups).flat().map(name=>({name,kind:'skills'}))];
export const integer=value=>Number.isSafeInteger(value)&&value>=0;
export function pointSources(character) {
  return [
    {id:'academic',type:'base',attribute:null,label:'Base Academic',amount:rules.academicBase,eligibleSkills:[...academics]},
    {id:'general',type:'base',attribute:null,label:'Base Other',amount:rules.generalBase,eligibleSkills:Object.values(groups).flat()},
    ...attributes.map(id=>({id,type:'attributeBonus',attribute:id,label:`${id} Bonus`,amount:integer(character.attr?.[id])?bonus(character.attr[id]):0,eligibleSkills:[...bonusSkills[id]]}))
  ];
}

// One engine owns source capacities, legal payments, manual reconciliation and
// source-first random allocation. Category summaries never authorize a payment.
export class AllocationEngine {
  constructor(character,{sources=pointSources(character),kinds=['academic','skills'],restore=true}={}) {
    this.character=character;
    this.definitions=skillDefinitions.filter(s=>kinds.includes(s.kind));
    this.sources=sources.map(s=>({...s,eligibleSkills:[...s.eligibleSkills],remaining:s.amount,allocations:[]}));
    this.payments=Object.fromEntries(this.definitions.map(s=>[s.name,{}]));
    const snapshot=character.creationPoints;
    if(restore&&kinds.length===2&&snapshot?.version===2&&snapshot.signature===this.signature()&&this.restore(snapshot))return;
    this.reconcile();
  }
  signature() {
    return JSON.stringify([this.sources.map(s=>[s.id,s.amount,s.eligibleSkills]),this.definitions.map(s=>[s.name,this.character[s.kind]?.[s.name]||0])]);
  }
  restore(snapshot) {
    try {
      if(!Array.isArray(snapshot.skills)||snapshot.skills.length!==this.definitions.length)throw Error();
      const seen=new Set();
      for(const skill of snapshot.skills){
        const definition=this.definitions.find(s=>s.name===skill.name&&s.kind===skill.kind);
        if(!definition||seen.has(skill.name))throw Error();
        seen.add(skill.name);
        for(const contribution of skill.sources)this.pay(contribution.poolId,skill.name,contribution.points);
        if(this.paid(skill.name)!==(this.character[skill.kind]?.[skill.name]||0))throw Error();
      }
      return true;
    } catch {
      this.reset();return false;
    }
  }
  reset() {
    this.sources.forEach(s=>{s.remaining=s.amount;s.allocations=[];});
    this.payments=Object.fromEntries(this.definitions.map(s=>[s.name,{}]));
  }
  paid(name) {return Object.values(this.payments[name]||{}).reduce((n,p)=>n+p,0);}
  pay(sourceId,name,points) {
    const source=this.sources.find(s=>s.id===sourceId);
    if(!integer(points)||!source||!this.payments[name]||!source.eligibleSkills.includes(name)||points>source.remaining)throw new Error('點數來源不足或不可支付此技能。');
    source.remaining-=points;
    this.payments[name][sourceId]=(this.payments[name][sourceId]||0)+points;
  }
  reconcile() {
    // Solve all requested skills together. Residual edges allow a flexible base
    // to move to an ineligible-for-bonus skill without duplicating the bonus.
    this.reset();
    const firstSkill=1+this.sources.length,sink=firstSkill+this.definitions.length;
    const graph=Array.from({length:sink+1},()=>[]);
    function edge(from,to,capacity){const a={to,capacity,remaining:capacity,reverse:graph[to].length},b={to:from,capacity:0,remaining:0,reverse:graph[from].length};graph[from].push(a);graph[to].push(b);return a;}
    const links=this.sources.flatMap((s,i)=>{
      edge(0,i+1,s.amount);
      return this.definitions.flatMap((d,j)=>s.eligibleSkills.includes(d.name)?[{id:s.id,name:d.name,edge:edge(i+1,firstSkill+j,Number.MAX_SAFE_INTEGER)}]:[]);
    });
    this.definitions.forEach((s,i)=>edge(firstSkill+i,sink,integer(this.character[s.kind]?.[s.name])?this.character[s.kind][s.name]:0));
    while(true){
      const previous=Array(graph.length).fill(null),queue=[0];previous[0]={};
      for(let q=0;q<queue.length&&!previous[sink];q++)for(const link of graph[queue[q]])if(link.remaining>0&&!previous[link.to]){previous[link.to]={from:queue[q],link};queue.push(link.to);}
      if(!previous[sink])break;
      let amount=Infinity;
      for(let at=sink;at;at=previous[at].from)amount=Math.min(amount,previous[at].link.remaining);
      for(let at=sink;at;at=previous[at].from){const {from,link}=previous[at];link.remaining-=amount;graph[at][link.reverse].remaining+=amount;}
    }
    for(const link of links)if(link.edge.capacity>link.edge.remaining)this.pay(link.id,link.name,link.edge.capacity-link.edge.remaining);
  }
  release(kind) {
    for(const skill of this.definitions.filter(s=>s.kind===kind)){
      for(const [id,points] of Object.entries(this.payments[skill.name]))this.sources.find(s=>s.id===id).remaining+=points;
      this.payments[skill.name]={};
    }
  }
  randomize(kind,names,rng) {
    this.release(kind);
    const cap=rules.skillCap;
    // Restrictive sources spend first. Every sampled increment is paid here,
    // before the resulting skill value is derived from its contributions.
    for(const source of [...this.sources].sort((a,b)=>a.eligibleSkills.length-b.eligibleSkills.length)){
      while(source.remaining>0){
        const possible=source.eligibleSkills.filter(name=>names.includes(name)&&this.paid(name)<cap);
        if(!possible.length)break;
        const sample=rng();if(!Number.isFinite(sample)||sample<0||sample>=1)throw new Error('隨機值必須介於 0 與 1 之間。');
        const name=possible[Math.floor(sample*possible.length)];
        this.pay(source.id,name,Math.min(5,source.remaining,cap-this.paid(name)));
      }
    }
    return Object.fromEntries(names.map(name=>[name,this.paid(name)]));
  }
  ledger() {
    const sources=this.sources.map(s=>({...s,skills:[...s.eligibleSkills],used:s.amount-s.remaining,allocations:this.definitions.flatMap(d=>this.payments[d.name][s.id]?[{name:d.name,points:this.payments[d.name][s.id]}]:[])}));
    const skills=this.definitions.map(({name,kind})=>{
      const contributions=Object.entries(this.payments[name]).filter(([,points])=>points>0).map(([poolId,points])=>({poolId,points}));
      const allocated=this.character[kind]?.[name]||0;
      return {name,kind,allocated,unfunded:Math.max(0,allocated-this.paid(name)),sources:contributions,baseContribution:contributions.filter(s=>!attributes.includes(s.poolId)).reduce((n,s)=>n+s.points,0),attributeBonusContributions:Object.fromEntries(attributes.map(id=>[id,this.payments[name][id]||0]))};
    });
    return {version:2,signature:this.signature(),used:sources.reduce((n,s)=>n+s.used,0),unfunded:skills.reduce((n,s)=>n+s.unfunded,0),sources,skills};
  }
  persist() {this.character.creationPoints=this.ledger();return this.character.creationPoints;}
  summary(kind) {
    const names=this.definitions.filter(s=>s.kind===kind).map(s=>s.name);
    const relevant=this.sources.filter(s=>s.eligibleSkills.some(n=>names.includes(n)));
    const contribution=s=>names.reduce((n,name)=>n+(this.payments[name][s.id]||0),0);
    const base=relevant.filter(s=>s.type==='base').reduce((n,s)=>n+s.amount,0);
    const bonus=relevant.filter(s=>s.type==='attributeBonus').reduce((n,s)=>n+contribution(s)+s.remaining,0);
    const allocated=names.reduce((n,name)=>n+this.paid(name),0);
    const requested=names.reduce((n,name)=>n+(this.character[kind]?.[name]||0),0);
    return {kind,base,bonus,total:base+bonus,allocated,remaining:base+bonus-allocated,requested,unfunded:requested-allocated};
  }
}
