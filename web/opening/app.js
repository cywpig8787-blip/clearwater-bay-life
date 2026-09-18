const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY="clearwater-life-opening-v1";
let state=JSON.parse(localStorage.getItem(KEY)||"{}");
state.page=state.page||1;
state.basic=state.basic||{};
state.skills=state.skills||{total:20,groups:{}};
state.family=state.family||{finance:"富裕",generation:"系統生成",notes:""};
state.school=state.school||{selected:null,firstHouse:null,secondHouse:null};
state.residence=state.residence||{boysChoice:null};

const steps=[
  ["Basic Information","基本資料"],
  ["Skills & Interests","能力與興趣"],
  ["Family Background","家庭背景"],
  ["Choose School","選擇學校"],
  ["Residence","住宿安排"],
  ["Confirmation","確認資料"]
];

const schools=[
  {id:"girls",name:"Rosamund Girls’ Academy",zh:"羅莎蒙德女子學院",kind:"女子學院",desc:"需填第一、第二學院志願；住宿由校方安排。"},
  {id:"boys",name:"Ravenwood Boys’ College",zh:"雷文伍德男子學院",kind:"男子學院",desc:"住宿可選。"},
  {id:"coed",name:"Clearwater Bay High School",zh:"克萊爾灣高級中學",kind:"男女混校",desc:"高一固定住宿。"}
];
const houses=["Valette House 瓦萊特學院","Quillan House 奎蘭學院","Fairmont House 翡爾蒙特學院","Hartwell House 哈特威爾學院"];
const skillGroups=["基礎技能 01","基礎技能 02","基礎技能 03","基礎技能 04","基礎技能 05","基礎技能 06"];

const save=()=>localStorage.setItem(KEY,JSON.stringify(state));

function init(){
  $("#steps").innerHTML=steps.map((s,i)=>'<button class="step" data-step="'+(i+1)+'"><b>'+(i+1)+'</b><span>'+s[0]+'<small>'+s[1]+'</small></span></button>').join("");
  for(let m=1;m<=12;m++)$("#birthMonth").insertAdjacentHTML("beforeend",'<option value="'+m+'">'+m+'</option>');
  for(let d=1;d<=31;d++)$("#birthDay").insertAdjacentHTML("beforeend",'<option value="'+d+'">'+d+'</option>');
  bindBasic();
  renderSkills();
  renderSchools();
  restoreBasic();
  restoreFamily();
  showPage(state.page);
}
function bindBasic(){
  ["firstName","lastName","preferredName","birthMonth","birthDay","gender","pronouns","statement"].forEach(id=>{
    $("#"+id).addEventListener("input",()=>{state.basic[id]=$("#"+id).value;save();renderSchools()});
  });
  $("#studentPhoto").onclick=()=>$("#creatorModal").classList.remove("hidden");
  $("#closeCreator").onclick=()=>$("#creatorModal").classList.add("hidden");
  $("#familyGeneration").onchange=()=>{state.family.generation=$("#familyGeneration").value;save()};
  $("#familyNotes").oninput=()=>{state.family.notes=$("#familyNotes").value;save()};
}
function restoreBasic(){
  Object.entries(state.basic).forEach(([k,v])=>{if($("#"+k))$("#"+k).value=v});
}
function restoreFamily(){
  $("#familyGeneration").value=state.family.generation||"系統生成";
  $("#familyNotes").value=state.family.notes||"";
}
function showPage(n){
  state.page=n;
  $$(".page").forEach(p=>p.classList.toggle("active",Number(p.dataset.page)===n));
  $$(".step").forEach(b=>b.classList.toggle("active",Number(b.dataset.step)===n));
  const s=schools.find(x=>x.id===state.school.selected);
  $$(".step")[4].classList.toggle("skipped",s?.id==="girls");
  if(n===4)renderSchools();
  if(n===5)renderResidence();
  if(n===6)renderSummary();
  save();
}
document.addEventListener("click",e=>{
  const next=e.target.closest("[data-next]"),prev=e.target.closest("[data-prev]"),step=e.target.closest("[data-step]");
  if(next)showPage(Number(next.dataset.next));
  if(prev)showPage(Number(prev.dataset.prev));
  if(step)showPage(Number(step.dataset.step));
});

function renderSkills(){
  $("#skillGrid").innerHTML=skillGroups.map((g,gi)=>{
    state.skills.groups[g]=state.skills.groups[g]||[0,0,0];
    return '<section class="skill-card"><h3>'+g+'</h3>'+
      [0,1,2].map(bi=>'<label class="branch"><span>分支 '+String(bi+1).padStart(2,"0")+'</span><input type="number" min="0" max="20" data-skill="'+gi+'" data-branch="'+bi+'" value="'+state.skills.groups[g][bi]+'"></label>').join("")+
      '</section>';
  }).join("");
  $$("[data-skill]").forEach(i=>i.oninput=()=>{
    const g=skillGroups[Number(i.dataset.skill)],bi=Number(i.dataset.branch);
    const old=state.skills.groups[g][bi]||0;
    let val=Math.max(0,Math.min(20,Number(i.value)||0));
    const usedWithout=skillUsed()-old;
    if(usedWithout+val>state.skills.total)val=state.skills.total-usedWithout;
    state.skills.groups[g][bi]=val;i.value=val;save();updatePoints();
  });
  updatePoints();
}
function skillUsed(){return Object.values(state.skills.groups).flat().reduce((a,b)=>a+(Number(b)||0),0)}
function updatePoints(){const used=skillUsed();$("#usedPoints").textContent=used;$("#remainingPoints").textContent=state.skills.total-used}

function eligible(s){
  const g=state.basic.gender||"";
  if(s.id==="coed")return true;
  if(s.id==="girls")return g!=="男性";
  if(s.id==="boys")return g!=="女性";
  return true;
}
function renderSchools(){
  $("#schoolCards").innerHTML=schools.map(s=>{
    const ok=eligible(s),sel=state.school.selected===s.id;
    return '<article class="school-card '+(sel?"selected ":"")+(ok?"":"blocked")+'"><h3>'+s.name+'</h3><b>'+s.zh+'</b><p>'+s.desc+'</p><button data-school="'+s.id+'" '+(ok?"":"disabled")+'>'+(sel?"✓ 已選擇":"選擇")+'</button></article>';
  }).join("");
  $$("[data-school]").forEach(b=>b.onclick=()=>{
    state.school.selected=b.dataset.school;
    if(state.school.selected!=="girls"){state.school.firstHouse=null;state.school.secondHouse=null}
    state.residence.boysChoice=null;save();renderSchools();
  });
  const hp=$("#housePanel");
  if(state.school.selected==="girls"){
    hp.classList.remove("hidden");
    hp.innerHTML='<h3>House Preferences / 學院志願</h3><div class="pref"><label>第一志願<select id="firstHouse"><option value="">請選擇</option>'+houses.map(h=>'<option>'+h+'</option>').join("")+'</select></label><label>第二志願<select id="secondHouse"><option value="">請選擇</option>'+houses.map(h=>'<option>'+h+'</option>').join("")+'</select></label></div>';
    $("#firstHouse").value=state.school.firstHouse||"";
    $("#secondHouse").value=state.school.secondHouse||"";
    $("#firstHouse").onchange=()=>{state.school.firstHouse=$("#firstHouse").value;if(state.school.secondHouse===state.school.firstHouse)state.school.secondHouse=null;save();renderSchools()};
    $("#secondHouse").onchange=()=>{if($("#secondHouse").value===state.school.firstHouse){$("#secondHouse").value="";return}state.school.secondHouse=$("#secondHouse").value;save()};
  } else hp.classList.add("hidden");
}
$("#schoolNext").onclick=()=>{
  const s=schools.find(x=>x.id===state.school.selected);
  if(!s){$("#schoolMessage").textContent="請先選擇學校。";return}
  if(s.id==="girls"&&(!state.school.firstHouse||!state.school.secondHouse)){ $("#schoolMessage").textContent="女子學院需要第一志願與第二志願。"; return }
  $("#schoolMessage").textContent="";
  if(s.id==="girls")showPage(6);else showPage(5);
};

function renderResidence(){
  const s=schools.find(x=>x.id===state.school.selected);
  if(!s){$("#residenceContent").innerHTML='<div class="residence-card">尚未選校。</div>';return}
  if(s.id==="girls"){showPage(6);return}
  if(s.id==="boys"){
    $("#residenceContent").innerHTML='<div class="residence-card"><h3>'+s.zh+'</h3><p>男校住宿可選。目前只決定是否住校，不設定未確認的宿舍棟、房型或住宿費。</p><div class="residence-choice"><button data-res="campus" class="'+(state.residence.boysChoice==="campus"?"selected":"")+'">校內住宿</button><button data-res="offcampus" class="'+(state.residence.boysChoice==="offcampus"?"selected":"")+'">不住校</button></div></div>';
    $$("[data-res]").forEach(b=>b.onclick=()=>{state.residence.boysChoice=b.dataset.res;save();renderResidence()});
  } else {
    $("#residenceContent").innerHTML='<div class="auto-residence"><h3>'+s.zh+'</h3><p><b>高一校內住宿已自動套用。</b></p><p>男女住宿區分開；宿舍棟、房間、室友與其他細節尚未正式設定。</p></div>';
  }
}
$("#residenceNext").onclick=()=>{
  const s=schools.find(x=>x.id===state.school.selected);
  if(s?.id==="boys"&&!state.residence.boysChoice){$("#residenceMessage").textContent="請先選擇住校或不住校。";return}
  $("#residenceMessage").textContent="";showPage(6);
};

function renderSummary(){
  const s=schools.find(x=>x.id===state.school.selected);
  const rows=[
    ["姓名",(state.basic.lastName||"")+" "+(state.basic.firstName||"")],
    ["生日",(state.basic.birthMonth||"—")+"/"+(state.basic.birthDay||"—")],
    ["性別",state.basic.gender||"—"],
    ["代名詞",state.basic.pronouns||"—"],
    ["技能點數",skillUsed()+" / "+state.skills.total],
    ["家庭經濟","富裕"],
    ["學校",s? s.zh+" / "+s.name:"—"]
  ];
  if(s?.id==="girls"){
    rows.push(["第一學院志願",state.school.firstHouse],["第二學院志願",state.school.secondHouse],["住宿","校內住宿，由學院／校方自動安排"]);
  }else if(s?.id==="boys"){
    rows.push(["住宿",state.residence.boysChoice==="campus"?"校內住宿":state.residence.boysChoice==="offcampus"?"不住校":"—"]);
  }else if(s?.id==="coed"){
    rows.push(["住宿","高一固定校內住宿"]);
  }
  $("#summary").innerHTML=rows.map(r=>'<div class="summary-row"><b>'+r[0]+'</b><span>'+r[1]+'</span></div>').join("");
}
$("#finish").onclick=()=>alert("測試版：Player State 建立接口已保留；正式 World State / Save 尚未接線。");
init();