export const attributes=['STR','CON','AGI','DEX','PER','INT'];
export const rules=Object.freeze({attributeTotal:250,attributeCap:65,skillCap:65,proficiencyTotal:500,proficiencyCap:75,motherTongueBase:55});
export const categories={
 '語言':{pair:['INT','PER'],skills:['母語']},'表達':{pair:['INT','PER'],skills:['寫作','演講','辯論']},
 '數理':{pair:['INT','PER'],skills:['數學','統計']},'自然科學':{pair:['INT','PER'],skills:['物理','化學','生物','地球科學','天文']},
 '社會與人文':{pair:['INT','PER'],skills:['歷史','地理','政治學','經濟','法律','心理學']},
 '藝術':{pair:['DEX','PER'],skills:['繪畫','雕塑／立體造型','攝影','設計']},
 '音樂':{pair:['INT','PER'],skills:['樂理','音訊製作']},'表演':{pair:['AGI','CON'],skills:['舞蹈','演戲','歌唱']},
 '資訊與媒體':{pair:['INT','DEX'],skills:['電腦','程式設計','影片製作']},
 '工程／製作':{pair:['INT','DEX'],skills:['工程','製作','修理','縫紉']},
 '生活技能':{pair:['DEX','PER'],skills:['烹飪','園藝','急救','載具操控','潛行','妙手／扒竊','開鎖','魔術／手技']},
 '體育':{pair:['STR','AGI'],skills:['運動','游泳','格鬥']},'人際':{pair:['INT','PER'],skills:['說服','欺瞞','交涉','洞察']},
 '感知／調查':{pair:['PER','INT'],skills:['偵查','調查']}
};
// CYW-51 provides examples and open-ended categories, not a closed proficiency catalogue.
export const proficiencyGroups={'藝術媒材':['素描','水彩','油畫','數位繪畫','炭筆','麥克筆','Photoshop','Illustrator','Clip Studio Paint','Blender'],
 '樂器與音訊':['鋼琴','吉他','小提琴','鼓'],'表演形式':['芭蕾','爵士舞','街舞','現代舞','國標舞','踢踏舞','戲劇','喜劇','歌劇','音樂劇','脫口秀'],
 '程式語言':['Python','JavaScript','C#','C++'],'運動與武術':['籃球','足球','棒球','排球','網球','高爾夫','羽球','桌球','田徑','擊劍','拳擊','柔道','空手道','跆拳道'],
 '其他具體熟練項目':[]};
export const financeTiers=Object.freeze([
 {id:'tier_1',label:'家庭資源第一級'}, {id:'tier_2',label:'家庭資源第二級'},
 {id:'tier_3',label:'家庭資源第三級'}, {id:'tier_4',label:'家庭資源第四級'},
 {id:'tier_5',label:'超富裕'}
]);

// Deferred interface metadata; this Creator round does not render or validate schools.
export const schools={coed:'Ravenwood High School',girls:'Rosamund Girls’ Academy',boys:'Avenor Boys’ Academy'};
