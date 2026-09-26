// One physical paper node; an opaque curtain covers each change of view.
// Content remains inert until BOTH the paper and its content fade have finished.
export class DocumentMotion {
 constructor({reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches,onState=()=>{},speed=1}={}) {
  this.state='desk';this.reduced=reduced;this.onState=onState;this.busy=false;this.speed=speed;
 }
 set(state){this.state=state;this.onState(state);}
 async animate(el,frames,duration){
  const a=el.animate(frames,{duration:this.reduced()?1:duration/this.speed,easing:'cubic-bezier(.22,.7,.25,1)',fill:'forwards'});
  try{await a.finished;Object.assign(el.style,frames.at(-1));}finally{a.cancel();}
 }
 async pick(sheet,content,desk,reading,curtain,changeView=()=>{}) {
  if(this.busy||this.state!=='desk')return false;
  this.busy=true;content.inert=true;content.ariaHidden='true';content.style.opacity='0';this.set('lifting');
  try{
   const lifted={...desk,transform:desk.transform+' translateY(-22px) scale(1.035)',filter:'drop-shadow(0 24px 16px #0009)'};
   await this.animate(sheet,[desk,lifted],180);
   this.set('darkening');await this.animate(curtain,[{opacity:'0'},{opacity:'1'}],170);
   this.set('black');changeView('reading');
   const near={...reading,transform:reading.transform+' translateY(12px) scale(.96)'};
   Object.assign(sheet.style,near);
   await this.animate(curtain,[{opacity:'1'},{opacity:'1'}],70);
   this.set('settling');
   await Promise.all([this.animate(curtain,[{opacity:'1'},{opacity:'0'}],170),this.animate(sheet,[near,reading],280)]);
   this.set('settled');this.set('revealing');await this.animate(content,[{opacity:'0'},{opacity:'1'}],180);
   content.inert=false;content.ariaHidden='false';this.set('reading');return true;
  }finally{this.busy=false;}
 }
 async put(sheet,content,desk,curtain,changeView=()=>{}) {
  if(this.busy||this.state!=='reading')return false;
  this.busy=true;content.inert=true;content.ariaHidden='true';this.set('hiding');
  try{
   await this.animate(content,[{opacity:'1'},{opacity:'0'}],130);
   this.set('darkening');await this.animate(curtain,[{opacity:'0'},{opacity:'1'}],170);
   this.set('black');changeView('desk');
   const aboveDesk={...desk,transform:desk.transform+' translateY(-22px) scale(1.035)',filter:'drop-shadow(0 24px 16px #0009)'};
   Object.assign(sheet.style,aboveDesk);
   await this.animate(curtain,[{opacity:'1'},{opacity:'1'}],70);
   this.set('returning');
   await Promise.all([this.animate(curtain,[{opacity:'1'},{opacity:'0'}],170),this.animate(sheet,[aboveDesk,desk],280)]);
   this.set('desk');return true;
  }finally{this.busy=false;}
 }
}
