export const schoolFonts=Object.freeze({coed:'Iansui',girls:'ChenYuLuoYan',boys:'LXGW WenKai TC'});
// Authored positions relative to the paper; never randomized or tied to viewport pixels.
// The renderer supports 1–3 sheets. Only the eligibility service supplies production IDs.
const deskLayouts={
 1:[{x:0,y:3,angle:-4,scale:.70}],
 2:[{x:-5,y:-3,angle:-3,scale:.75},{x:6,y:3,angle:2,scale:.75}],
 3:[{x:-8,y:-4,angle:-4,scale:.75},{x:0,y:0,angle:0,scale:.75},{x:8,y:4,angle:3,scale:.75}]
};
export function documentPose(index,count,reading=false){
 const p=deskLayouts[count]?.[index];if(!p)throw Error('Invalid school paper layout');
 return {transform:reading?'translate(-50%, -50%) translate(0%, 0%) rotate(0deg) scale(1)':`translate(-50%, -50%) translate(${p.x}%, ${p.y}%) rotate(${p.angle}deg) scale(${p.scale})`,filter:reading?'drop-shadow(0 18px 20px #000a)':'drop-shadow(2px 5px 3px #0008)'};
}
export const schoolLatinFonts=Object.freeze({coed:['Courier Prime'],girls:['Pinyon Script','Cormorant Garamond'],boys:['IBM Plex Sans','IBM Plex Mono']});
export async function loadSchoolFont(id,fontSet=document.fonts){
 const family=schoolFonts[id];if(!family)throw Error('未知學校字體');
 await Promise.all([family,...schoolLatinFonts[id]].map(async name=>{
  const sample=name===family?'入學資訊學校確認閱讀':'Admissions School 09';
  const query=`400 18px "${name}"`,faces=await fontSet.load(query,sample);
  if(!faces.length||faces.some(face=>face.status!=='loaded')||!fontSet.check(query,sample))throw Error(`${name} 字體未能載入`);
 }));
 return family;
}
const assetPromises=new Map();
export function prepareSchoolResources(ids){
 return Promise.all(ids.map(id=>{
  if(!assetPromises.has(id)){
   const asset={coed:'ravenwood',girls:'rosamund',boys:'avenor'}[id];
   const promise=Promise.all([loadSchoolFont(id),...['desk.jpg',asset+'-paper.png',asset+'-source.jpg'].map(file=>{
    const img=new Image();img.src=new URL('./assets/'+file,import.meta.url);return img.decode();
   })]).catch(error=>{assetPromises.delete(id);throw error;});
   assetPromises.set(id,promise);
  }
  return assetPromises.get(id);
 }));
}
