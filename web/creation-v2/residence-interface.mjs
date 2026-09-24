export const residenceFields=['residenceId','residenceType','buildingId','floorId','roomId','bedId','schoolId','roommateId','ownership','tenancy','payer'];
export function pendingResidence(schoolId){return {schoolId,status:'pending_preparation_week',assignment:null};}
