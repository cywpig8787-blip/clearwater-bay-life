export const schoolFonts=Object.freeze({coed:'Iansui',girls:'ChenYuLuoYan',boys:'LXGW WenKai TC'});
// Authored positions relative to the paper; never randomized or tied to viewport pixels.
// The renderer supports 1–3 sheets. Only the eligibility service supplies production IDs.
const deskLayouts={
 1:[{x:0,y:3,angle:-4,scale:.70}],
 2:[{x:-27,y:-3,angle:-6,scale:.68},{x:29,y:6,angle:5,scale:.68}],
 3:[{x:-48,y:-5,angle:-6,scale:.64},{x:0,y:7,angle:2,scale:.64},{x:48,y:-1,angle:6,scale:.64}]
};
export function documentPose(index,count,reading=false){
 const p=deskLayouts[count]?.[index];if(!p)throw Error('Invalid school paper layout');
 return {transform:reading?'translate(-50%, -50%) translate(0%, 0%) rotate(0deg) scale(1)':`translate(-50%, -50%) translate(${p.x}%, ${p.y}%) rotate(${p.angle}deg) scale(${p.scale})`,filter:reading?'drop-shadow(0 18px 20px #000a)':'drop-shadow(2px 5px 3px #0008)'};
}
export async function loadSchoolFont(id,fontSet=document.fonts){
 const family=schoolFonts[id];if(!family)throw Error('未知學校字體');
 const faces=await fontSet.load(`400 18px "${family}"`,'入學資訊學校確認閱讀');
 if(!faces.length||faces.some(face=>face.status!=='loaded')||!fontSet.check(`400 18px "${family}"`,'入學資訊學校確認閱讀'))throw Error(`${family} 字體未能載入`);
 return family;
}
