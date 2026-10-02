export const MAX_EMPHASIS=2;
export const emphasisTotal=v=>Object.values(v).reduce((n,x)=>n+(x?.salience||0),0);
export function allowed(id,item,values){
 const v={...values,[id]:item};
 if(emphasisTotal(v)>MAX_EMPHASIS)return false;
 if(v.body?.heights&&v.height&&!v.body.heights.includes(v.height.label))return false;
 return true;
}
export function issues(s){
 const v=s.values||{},out=[];
 if(emphasisTotal(v)>MAX_EMPHASIS)out.push('突出輪廓過多，請重抽一項。');
 if(v.body?.heights&&v.height&&!v.body.heights.includes(v.height.label))out.push('身高與小巧體型不相容。');
 return out;
}
