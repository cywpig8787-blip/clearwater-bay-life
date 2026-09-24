// CYW-51 creation rules and eligible skills confirmed on 2026-09-23.
export const rules = Object.freeze({attributeTotal:250,attributeCap:65,baseline:50,academicBase:200,generalBase:200,skillCap:75});
export const attributes = ['STR','CON','AGI','DEX','PER','INT'];
export const academics = ['語文','English','Spanish','French','Japanese','Mandarin Chinese','數學','物理','化學','生物','歷史','地理','政治／公民','經濟','法律','心理'];
export const groups = {
  '視覺藝術與設計':['繪畫','雕塑／立體造型','攝影','設計'],
  '音樂與表演':['音樂','表演','舞蹈'],
  '媒體製作':['影像製作','音訊製作'],
  '資訊與數位技術':['電腦','程式設計','資料分析'],
  '工程、製作與修繕':['工程','電子','機械','修理','木工','縫紉','手工藝'],
  '生活與實用':['烹飪','家務','園藝','急救','生存','駕駛'],
  '體育與身體技術':['跑步','游泳','自行車','滑行','籃球','足球','排球','棒球／壘球','網球','羽毛球','拳擊','跆拳道','空手道','柔道','體操','滑雪'],
  '溝通與社會互動':['演說','辯論','交涉','欺瞞','洞察'],
  '世界玩法':['潛行','妙手']
};
export const bonusSkills = {
  STR:['拳擊','跆拳道','空手道','柔道'],
  CON:['跑步','游泳','自行車','生存'],
  AGI:[...groups['體育與身體技術'],'表演','舞蹈'],
  DEX:[...groups['工程、製作與修繕'],'繪畫','雕塑／立體造型','妙手'],
  PER:['攝影','洞察','急救'],
  INT:[...academics,...groups['資訊與數位技術']]
};
export const sum = obj => Object.values(obj||{}).reduce((a,b)=>a+(Number(b)||0),0);
export const bonus = value => Math.max(0,Number(value||0)-rules.baseline);

