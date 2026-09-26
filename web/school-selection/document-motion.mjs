// One clock owns document movement, the opaque swap and the reveal.
// Resources must be ready before entering this state machine.
export class DocumentMotion {
 constructor({reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches,onState=()=>{},speed=1,onMeasure=()=>{}}={}) {
  this.state='desk';this.reduced=reduced;this.onState=onState;this.busy=false;this.speed=speed;this.onMeasure=onMeasure;
 }
 set(state){this.state=state;this.onState(state);}
 async animate(el,frames,duration){
  const a=el.animate(frames,{duration:this.reduced()?1:duration/this.speed,easing:'cubic-bezier(.22,.7,.25,1)',fill:'forwards'});
  try{await a.finished;Object.assign(el.style,frames.at(-1));}finally{a.cancel();}
 }
 async mask(curtain,{before=()=>Promise.resolve(),swap=()=>{},after=()=>Promise.resolve(),final='desk',kind='transition'}={}){
  if(this.busy)return false;
  this.busy=true;const start=performance.now();
  try{
   this.set('darkening');
   await Promise.all([before(),this.animate(curtain,[{opacity:'0'},{opacity:'1'}],160)]);
   this.set('black');swap(); // synchronous: no network, decoding or timers under black
   this.set('revealing');
   await Promise.all([after(),this.animate(curtain,[{opacity:'1'},{opacity:'0'}],200)]);
   this.set(final);return true;
  }finally{
   this.busy=false;
   const measurement={kind,durationMs:performance.now()-start,targetMs:360,speed:this.speed,reduced:this.reduced()};
   this.onMeasure(measurement);
   if(!measurement.reduced&&measurement.durationMs*this.speed>500)console.warn('Document transition exceeded 500 ms',measurement);
  }
 }
 async pick(sheet,content,desk,reading,curtain,changeView=()=>{}) {
  if(this.busy||this.state!=='desk')return false;
  content.inert=true;content.ariaHidden='true';content.style.opacity='0';
  const result=await this.mask(curtain,{
   kind:'pick',final:'reading',
   before:()=>this.animate(sheet,[desk,{...desk,transform:desk.transform+' translateY(-16px) scale(1.025)'}],160),
   swap:()=>{changeView('reading');Object.assign(sheet.style,reading);content.style.opacity='1';}
  });
  content.inert=false;content.ariaHidden='false';return result;
 }
 async put(sheet,content,desk,curtain,changeView=()=>{}) {
  if(this.busy||this.state!=='reading')return false;
  content.inert=true;content.ariaHidden='true';
  return this.mask(curtain,{
   kind:'put',final:'desk',before:()=>this.animate(content,[{opacity:'1'},{opacity:'0'}],120),
   swap:()=>{changeView('desk');Object.assign(sheet.style,desk);}
  });
 }
}
