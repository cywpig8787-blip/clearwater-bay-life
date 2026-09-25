// Presentation only: native buttons and existing allocation/navigation handlers remain authoritative.
const assetRoot=new URL('./assets/buttons/',import.meta.url);
export function assetIcon(name){
 const image=document.createElement('img');
 image.className='ui-icon';image.src=new URL(`icon-${name}.png`,assetRoot).href;
 image.alt='';image.setAttribute('aria-hidden','true');image.draggable=false;
 return image;
}
export function decorateButtons(root=document){
 for(const button of root.querySelectorAll('button:not(.note-tab):not(.portrait-hit)'))button.classList.add('paper-button');
 for(const selector of ['#next','#financeRoll','#confirmCrop','#saveBirthday'])root.querySelector(selector)?.classList.add('paper-button--ornate');
 const icons={back:'left',next:'right',financeRoll:'dice',randomAttributes:'dice',randomSkills:'dice',randomProficiencies:'dice',devReroll:'reset',resetCrop:'reset',closeDetail:'close'};
 for(const [id,name] of Object.entries(icons)){
  const button=root.querySelector('#'+id);if(!button||button.querySelector('.ui-icon'))continue;
  // Confirmation has its own text; a forward arrow is reserved for navigation.
  if(id==='next'&&button.textContent==='確認角色資料')continue;
  id==='next'?button.append(assetIcon(name)):button.prepend(assetIcon(name));
 }
 for(const button of root.querySelectorAll('dialog button'))if(button.textContent==='取消'&&!button.querySelector('.ui-icon'))button.prepend(assetIcon('close'));
 const developer=root.querySelector('.developer-heading');
 if(developer&&!developer.querySelector('.ui-icon'))developer.prepend(assetIcon('gear'));
 const upload=root.querySelector('.portrait-hint');
 if(upload&&!upload.querySelector('.ui-icon'))upload.prepend(assetIcon('upload'));
}
