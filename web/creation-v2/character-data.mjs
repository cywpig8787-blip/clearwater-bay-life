import {attributes} from './catalog.mjs';
export {attributes,academics,groups,bonusSkills,rules} from './catalog.mjs';
export const schools={coed:['Ravenwood High School','雷文伍德高中'],girls:['Rosamund Girls’ Academy','羅莎蒙德女子學院'],boys:['Avenor Boys’ Academy','阿維諾男子學院']};
export const houses=['Valette 瓦萊特','Quillan 奎蘭特','Fairmont 費爾蒙特','Hartwell 哈特威爾'];
export function newCharacter(){return {version:2,page:0,basic:{name:'',birthday:'09/01',gender:'中性',pronouns:''},bodyTraits:{chest:'flat'},appearance:{},proficiencies:{},knowledge:{},attr:Object.fromEntries(attributes.map(a=>[a,30])),academic:{},skills:{},contributions:{academic:{},skills:{}},family:{finance:'富裕',notes:''},experience:'',school:'',house:'',residence:'',dev:false,openGroups:{}};}
export const canonicalGender=g=>({男性:'male',女性:'female',中性:'neutral'})[g]||g;
