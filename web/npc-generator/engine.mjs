import {fields,pools as visualPools,eyeShapes,irisColors,hairShapes,hairColors} from './catalog.mjs?v=appearance-compact1';
import {styles} from './fashion.mjs?v=appearance-compact1';
import {allowed,issues} from './rules.mjs?v=appearance-compact1';
export {fields,styles,issues};
export const pools={...visualPools,core:styles};
export const modes={all:fields.map(f=>f.id)};
export const createState=()=>({version:4,mode:'all',values:{},locked:{},recent:{},history:[],count:0});
export function seeded(seed){let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
const draw=rng=>{const n=rng();if(!Number.isFinite(n)||n<0||n>=1)throw Error('無效隨機值');return n;};
export function pick(items,recent=[],rng=Math.random){
 if(!items?.length)throw Error('沒有相容選項，請解鎖相關欄位。');
 const fresh=items.filter(x=>!recent.includes(x.label)),p=fresh.length?fresh:items;
 let n=draw(rng)*p.reduce((sum,x)=>sum+(x.weight??1),0);
 for(const item of p){n-=item.weight??1;if(n<0)return structuredClone(item);}return structuredClone(p.at(-1));
}
export function lockAll(state){const s=structuredClone(state);for(const f of fields)if(s.values[f.id])s.locked[f.id]=true;return s;}
export const unlockAll=state=>({...state,locked:{}});
export const clearCharacter=state=>({...createState(),history:state.history,recent:state.recent,count:state.count});
function poolFor(id,rng){
 if(id==='feature'){const p=draw(rng),count=p<.62?0:p<.97?1:2;return pools.feature.filter(x=>x.marks.length===count);}
 if(id==='hair'){const kind=draw(rng)<.75?'natural':'dyed';return pools.hair.filter(x=>x.kind===kind);}
 return pools[id];
}
export function roll(state,{only=null,rng=Math.random}={}){
 if(only&&!modes.all.includes(only))throw Error('未知欄位');
 if(only&&state.locked[only])return {state,changed:[],notes:issues(state)};
 const s=structuredClone(state),target=new Set(only?[only]:modes.all);
 for(const {id} of fields)if(!s.values[id])target.add(id);
 for(const id of target)if(!s.locked[id]||!s.values[id])delete s.values[id];
 const changed=[];
 for(const {id} of fields){
  if(s.values[id])continue;
  const item=pick(poolFor(id,rng).filter(x=>allowed(id,x,s.values)),s.recent[id]||[],rng);
  s.values[id]=item;s.recent[id]=[...(s.recent[id]||[]),item.label].slice(-8);changed.push(id);
 }
 if(issues(s).length)throw Error('鎖定的外貌需要調整。');
 if(changed.length){s.count++;s.history.unshift({number:s.count,values:structuredClone(s.values)});s.history=s.history.slice(0,100);}
 return {state:s,changed,notes:[]};
}
export function textFor(s){
 const groups=[...new Set(fields.map(f=>f.group))];
 return groups.map(group=>'【'+group+'】\n'+fields.filter(f=>f.group===group&&s.values[f.id]?.label).map(f=>f.label+'：'+s.values[f.id].label).join('\n')).join('\n\n');
}
const catalogs=Object.fromEntries(fields.map(({id})=>[id,new Map(pools[id].map(x=>[x.label,x]))]));
function sanitizeValues(raw){
 const values={};for(const {id} of fields){const x=catalogs[id].get(raw?.[id]?.label);if(x&&allowed(id,x,values))values[id]=structuredClone(x);}return values;
}
// Only migration reads former detail keys; they never become active fields or stored state.
function migrateValues(raw){
 const v=sanitizeValues(raw),label=id=>typeof raw?.[id]?.label==='string'?raw[id].label:'';
 const set=(id,name)=>{const item=catalogs[id].get(name);if(!v[id]&&item&&allowed(id,item,v))v[id]=structuredClone(item);};
 const h=label('height');if(h)set('height',/高挑/.test(h)?'高挑':/偏矮|較矮/.test(h)?'偏矮':/較高|偏高/.test(h)?'偏高':'中等');
 const b=label('body');if(b){set('body',/上身厚實/.test(b)?'上身較厚實，四肢偏細':/軀幹薄/.test(b)?'寬肩薄身':/肌肉|結實/.test(b)?'結實':/圓潤|柔軟/.test(b)?'柔軟圓潤':/纖薄|纖瘦|纖細/.test(b)?'纖細':/厚實/.test(b)?'偏厚實':'勻稱');}
 const skins={'極淺米白':'冷白','淺米白':'奶油白','米膚色':'暖米色','淺杏褐色':'米杏色','中淺褐色':'淺褐色','中等褐色':'暖棕','中等棕色':'中性棕','中深棕色':'深棕','深棕色':'深棕','深褐色':'深褐','深赤褐色':'深赤褐','極深棕色':'極深棕'};set('skin',skins[label('skin')]||label('skin'));
 const face=label('face').split(/[、，]/)[0];set('face',({'橢圓臉':'柔和橢圓臉','方圓臉':'圓方臉','圓臉':'圓臉，下顎略收','偏長臉':'偏長臉，兩頰平滑','短橢圓臉':'短橢圓臉','鵝蛋臉':'鵝蛋臉'})[face]||face);
 const eye=label('eyes');let shape=/細長|窄長/.test(eye)?'細長杏眼':/圓杏|偏圓/.test(eye)?'圓杏眼':/橢圓/.test(eye)?'橢圓眼':/圓眼/.test(eye)?'圓眼':'杏眼';
 const size=label('eyeSize');if(/偏小/.test(size)&&eyeShapes.some(x=>x.label==='偏小'+shape))shape='偏小'+shape;else if(/偏大/.test(size)&&eyeShapes.some(x=>x.label==='偏大'+shape))shape='偏大'+shape;
 else if(/單眼皮/.test(label('eyelid'))&&shape==='細長杏眼')shape='細長單眼皮';
 const iris=label('iris').replace(/色$/,'').replace('榛綠棕','榛綠').replace('深褐','深棕').replace('石灰','冷灰');if(eye)set('eyes',shape);if(irisColors.includes(iris))set('iris',iris);
 const brow=label('brows');if(brow)set('brows',/豆/.test(brow)?'短豆形眉':/平/.test(brow)?(/濃/.test(label('browWeight'))?'偏濃平眉':'略長平眉'):(/淡/.test(label('browWeight'))?'淡色柔弧眉':'平緩弧眉'));
 const nose=label('nose');if(nose)set('nose',/略窄/.test(nose)?'鼻樑略窄，鼻尖稍尖':/微翹/.test(nose)?'短鼻，鼻尖微翹':/微凸/.test(nose)?'鼻樑微凸，鼻尖柔和':/較寬|稍寬/.test(nose)?'鼻翼稍寬，鼻尖柔和':/低/.test(nose)?'鼻樑偏低，鼻尖圓潤':'平直鼻樑，鼻尖圓潤');
 const lips=label('lips');if(lips)set('lips',/唇珠/.test(lips)?'唇珠略明顯':/偏厚|較厚|略厚/.test(lips)?'雙唇偏厚，唇峰柔和':/薄/.test(lips)?'上唇稍薄，下唇圓潤':'上下唇適中，唇峰平緩');
 const oldHair=label('hair'),texture=label('hairTexture');let silhouette=/寸/.test(oldHair)?'均勻寸頭':/及腰/.test(oldHair)?'及腰長':/背中/.test(oldHair)?'背中長':/肩下/.test(oldHair)?'肩下長':/鎖骨/.test(oldHair)?'鎖骨長度':/及肩/.test(oldHair)?'及肩':/下巴/.test(oldHair)?'下巴長度':/耳下/.test(oldHair)?'耳下':'短';
 if(silhouette!=='均勻寸頭')silhouette+=/螺旋|折線/.test(texture)?'螺旋捲髮':/環捲/.test(texture)?'捲髮':/波浪|微彎/.test(texture)?'波浪髮':'直髮';
 const hairShape=hairShapes.find(x=>x.label===silhouette)||hairShapes.find(x=>x.label.startsWith(silhouette));
 const aliases={'自然黑':'黑','中性深棕':'深棕','中性棕':'中棕','霧灰藍':'霧藍','煙粉':'灰粉'};const color=aliases[label('hairColor')]||label('hairColor');
 if(oldHair&&hairShape&&hairColors.some(x=>x.label===color))set('hair',color+'色'+hairShape.label);
 const feature=label('feature').replace('無額外辨識特徵','無明顯特殊標記').replaceAll('短淡疤','小疤').replaceAll('鼻樑少量淡雀斑','鼻樑淡雀斑');set('feature',feature);
 return v;
}
export function restore(raw){
 const s=createState();if(!raw||![2,3,4].includes(raw.version))return s;
 const legacy=raw.version!==4,clean=legacy?migrateValues:sanitizeValues;
 s.values=clean(raw.values);
 for(const {id} of fields){
  if(s.values[id]&&raw.locked?.[id]===true)s.locked[id]=true;
  if(!legacy&&Array.isArray(raw.recent?.[id]))s.recent[id]=raw.recent[id].filter(x=>catalogs[id].has(x)).slice(-8);
 }
 s.count=Number.isSafeInteger(raw.count)&&raw.count>=0?raw.count:0;
 if(Array.isArray(raw.history))s.history=raw.history.slice(0,100).filter(h=>h&&Number.isSafeInteger(h.number)&&h.number>=0).map(h=>({number:h.number,values:clean(h.values)})).filter(h=>Object.keys(h.values).length===fields.length);
 return s;
}
