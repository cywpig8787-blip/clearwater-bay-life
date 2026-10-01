import {pools,marks} from './catalog.mjs';
import {styles,styleOptions} from './fashion.mjs';
export const MAX_EMPHASIS=2;
export const wardrobe=['silhouette','palette','shoes','accessory'];
export const dependencies={hair:['hairTexture','hairVolume','fringe','part','tie'],hairTexture:['fringe','part','tie'],fringe:['part'],core:wardrobe};
export const emphasisFields=['height','face','eyeSize','eyeTilt','nose','lips','hair'];
export const emphasisTotal=values=>emphasisFields.reduce((n,id)=>n+(values[id]?.salience||0),0);
export function compatible(id,item,v){
 if(id==='core')return wardrobe.every(k=>!v[k]||styleOptions(item,k).some(x=>x.label===v[k].label));
 if(wardrobe.includes(id))return !v.core||styleOptions(v.core,id).some(x=>x.label===item.label);
 if(id==='hair')return ['hairTexture','fringe','part','tie'].every(k=>!v[k]||hairOption(k,v[k],item.length,v.fringe));
 if(['hairTexture','fringe','part','tie'].includes(id)){
  if(v.hair&&!hairOption(id,item,v.hair.length,v.fringe))return false;
  // Tight curls retain their texture: use a rounded / separated fringe, not thin straight fringe geometry.
  if(id==='fringe'&&item.textures&&v.hairTexture&&!item.textures.includes(v.hairTexture.texture))return false;
  if(id==='fringe'&&['curl','coil'].includes(v.hairTexture?.texture)&&/齊|八字|側掃|斜向|簾式/.test(item.label))return false;
  return true;
 }
 return true;
}
function hairOption(id,item,length,fringe){
 if(length<(item.min||0)||length>(item.max??5))return false;
 // A fringe can cover a scalp part, but its direction cannot fight the visible part.
 if(id==='part'&&fringe&&/齊|圓弧/.test(fringe.label))return item.label==='不露明顯分線';
 if(id==='fringe'&&length===0)return item.label==='無獨立瀏海';
 return true;
}
export function candidates(id,v){
 if(id==='core')return styles;
 if(wardrobe.includes(id))return styleOptions(v.core,id);
 return pools[id]||[];
}
export function allowed(id,item,v){
 if(!compatible(id,item,v))return false;
 const next={...v,[id]:item};
 if(emphasisTotal(next)>MAX_EMPHASIS)return false;
 // Never stack two prominent eye modifiers on the same small facial region.
 if((next.eyeSize?.salience||0)+(next.eyeTilt?.salience||0)>1)return false;
 return true;
}
export function markOptions(){
 const out=[{label:'無額外辨識特徵',marks:[],weight:5}];
 for(const m of marks)out.push({label:m.label,marks:[m.label],weight:1});
 for(let i=0;i<marks.length;i++)for(let j=i+1;j<marks.length;j++){
  const a=marks[i],b=marks[j];
  // At most one facial marking; never duplicate the same mark category.
  if(a.type===b.type||a.site===b.site)continue;
  out.push({label:a.label+'；'+b.label,marks:[a.label,b.label],weight:1});
 }
 return out;
}
export const featureOptions=markOptions();
export function issues(s){
 const v=s.values||{},out=[];
 if(emphasisTotal(v)>MAX_EMPHASIS)out.push('突出特徵超出上限。');
 if((v.eyeSize?.salience||0)+(v.eyeTilt?.salience||0)>1)out.push('眼睛突出特徵重疊。');
 for(const [id,x] of Object.entries(v))if(!compatible(id,x,v))out.push(`${id} 的鎖定搭配需要調整。`);
 return [...new Set(out)];
}
