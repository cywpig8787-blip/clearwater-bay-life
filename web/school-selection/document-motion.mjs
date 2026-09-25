// Reusable paper motion; UI stays on the same physical DOM sheet throughout.
export class DocumentMotion {
 constructor({reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches,onState=()=>{}}={}){this.state='desk';this.reduced=reduced;this.onState=onState;this.busy=false;}
 set(state){this.state=state;this.onState(state);}
 async animate(el,frames,duration){const a=el.animate(frames,{duration:this.reduced()?1:duration,easing:'cubic-bezier(.22,.7,.25,1)',fill:'forwards'});try{await a.finished;const end=frames.at(-1);Object.assign(el.style,end);}finally{a.cancel();}}
 async pick(sheet,ui,desk,reading){if(this.busy||this.state!=='desk')return false;this.busy=true;this.set('lifting');try{
 ui.inert=true;ui.ariaHidden='true';ui.style.opacity='0';
 await this.animate(sheet,[desk,{...desk,transform:desk.transform+' translateY(-18px)',filter:'drop-shadow(0 22px 16px #0008)'},reading],360);
 this.set('reading');ui.inert=false;ui.ariaHidden='false';await this.animate(ui,[{opacity:'0'},{opacity:'1'}],140);return true;
 }finally{this.busy=false;}}
 async put(sheet,ui,desk){if(this.busy||this.state!=='reading')return false;this.busy=true;this.set('returning');try{
 ui.inert=true;ui.ariaHidden='true';await this.animate(ui,[{opacity:'1'},{opacity:'0'}],110);
 await this.animate(sheet,[{transform:sheet.style.transform,filter:sheet.style.filter},desk],340);this.set('desk');return true;
 }finally{this.busy=false;}}
}
