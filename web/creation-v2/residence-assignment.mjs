// Residence is a world procedure. Character creation never chooses a side.
export const residenceFields=['residentialAccess','residenceId','buildingId','floorId','roomId','bedId'];
export function withoutAssignment(character){const copy=structuredClone(character);for(const key of residenceFields)delete copy[key];return copy;}
export function residentialSide(gender,choice){
 if(['男性','male'].includes(gender))return 'male_side';
 if(['女性','female'].includes(gender))return 'female_side';
 return ['中性','neutral'].includes(gender)&&['male_side','female_side'].includes(choice)?choice:null;
}
export function assignResidence(character,dormitories){
 const side=residentialSide(character.basic?.gender,character.residentialAccess);
 if(!side)throw new Error('請在住宿階段選擇男側或女側。');
 const available=dormitories.filter(d=>d.side===side);
 const buildingId=available.some(d=>d.id===character.buildingId)?character.buildingId:available[0].id;
 const roomId=`dorm-${buildingId}-2-room-1`;
 return {residentialAccess:side,residenceId:`dorm-${buildingId}`,buildingId,floorId:`dorm-${buildingId}-2`,roomId,bedId:`${roomId}-bed-1`};
}
