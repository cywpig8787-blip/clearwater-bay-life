import {academics,groups,attributes,bonusSkills} from './catalog.mjs';
import {integer,validateAttributes} from './attribute-engine.mjs';
import {allocationPolicy} from './developer-override.mjs';
export const namesFor=kind=>kind==='academic'?academics:kind==='skills'?Object.values(groups).flat():[];
export function sources(s){
 return [{id:'academic',label:'Academic Base',amount:200,eligibleSkills:[...academics]},
 {id:'other',label:'Other Base',amount:200,eligibleSkills:namesFor('skills')},
 ...attributes.filter(id=>s.attr[id]>50).map(id=>({id,label:id+' Bonus',amount:Math.max(0,s.attr[id]-50),eligibleSkills:[...new Set(bonusSkills[id])]}))];
}
export function ledger(s,{normal=false}={}){
 const policy=allocationPolicy(s,{normal});validateAttributes(s.attr,policy);
 const entries=sources(s).map(source=>({...source,used:0,remaining:source.amount,allocations:[]}));
 const skills=[];
 for(const kind of ['academic','skills']){
  for(const name of new Set([...Object.keys(s[kind]),...Object.keys(s.contributions[kind])])){
   if(!namesFor(kind).includes(name))throw new Error('未知技能：'+name);
   const value=Object.hasOwn(s[kind],name)?s[kind][name]:0;integer(value);if(value>policy.skillCap)throw new Error('技能單項上限為 75。');
   const contributions=s.contributions[kind][name]||{};let paid=0;
   for(const [id,amount] of Object.entries(contributions)){
    integer(amount);const source=entries.find(x=>x.id===id);
    if(!source||!source.eligibleSkills.includes(name))throw new Error('不合法付款來源：'+id+' → '+name);
    source.used+=amount;source.remaining-=amount;paid+=amount;
    if(amount)source.allocations.push({kind,name,points:amount});
   }
   if(paid!==value)throw new Error('技能投入缺少付款來源：'+name);
   skills.push({kind,name,allocated:value,contributions:{...contributions}});
  }
 }
 if(entries.some(x=>x.remaining<0))throw new Error('點數來源餘額不足。');
 return {version:2,sources:entries,skills};
}
export function summary(s,kind){
 const l=ledger(s),base=l.sources.find(x=>x.id===(kind==='academic'?'academic':'other'));
 const bonusSources=l.sources.filter(x=>!['academic','other'].includes(x.id)&&x.eligibleSkills.some(name=>namesFor(kind).includes(name)));
 const allocated=l.skills.filter(x=>x.kind===kind).reduce((n,x)=>n+x.allocated,0);
 const bonus=bonusSources.reduce((n,x)=>n+x.remaining+x.allocations.filter(a=>a.kind===kind).reduce((n,a)=>n+a.points,0),0);
 return {base:base.amount,bonus,total:base.amount+bonus,allocated,remaining:base.amount+bonus-allocated};
}
