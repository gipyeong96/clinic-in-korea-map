export const guideUpdated='2026-10-22';
export const careGuides=[
 {slug:'before-visiting-a-clinic-in-korea',tag:'VISITING A CLINIC',title:'Before visiting a clinic in Korea',description:'A practical checklist for appointments, communication, documents, costs and getting to the right branch.'},
 {slug:'understand-clinic-information',tag:'READING CLINIC INFORMATION',title:'What specialist and registration information means',description:'Understand reported departments, specialist counts and international-patient registration before comparing clinics.'},
 {slug:'choose-urology-clinic-gangnam',tag:'CHOOSING A CLINIC',title:'How to choose a urology clinic in Gangnam',description:'Compare reported specialists, services, location and what to confirm before visiting.'},
];
export function contextualCareGuides(context:{department?:string;location?:string;specialist?:boolean;registered?:boolean;stage?:'results'|'profile'|'nearby'}){
 const visit=careGuides[0],information=careGuides[1],local=careGuides[2];
 const inGangnamArea=['gangnam','gangnam-station','area-seoul-gangnam-gu','area-seoul-seocho-gu'].includes(context.location||'');
 const regional=context.stage!=='nearby'&&context.department==='urology'&&inGangnamArea;
 const evidence=context.specialist||context.registered;
 return context.stage==='profile'?[visit,regional?local:information]:evidence?[information,regional?local:visit]:[visit,regional?local:information];
}
