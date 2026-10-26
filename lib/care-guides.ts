export const guideUpdated='2026-10-22';
export const careGuides=[
 {slug:'before-visiting-a-clinic-in-korea',tag:'VISITING A CLINIC',title:'Before visiting a clinic in Korea',description:'A practical checklist for appointments, communication, documents, costs and getting to the right branch.'},
 {slug:'understand-clinic-information',tag:'READING CLINIC INFORMATION',title:'What specialist and registration information means',description:'Understand reported departments, specialist counts and international-patient registration before comparing clinics.'},
 {slug:'choose-urology-clinic-gangnam',tag:'CHOOSING A CLINIC',title:'How to choose a urology clinic in Gangnam',description:'Compare reported specialists, services, location and what to confirm before visiting.'},
 {slug:'find-a-dentist-in-korea',tag:'FINDING A DENTIST',title:'How to find a dentist in Korea',description:'Find dental clinics near your location or station, compare directory information and prepare questions about language, appointments and costs.'},
 {slug:'weekend-clinics-seoul',tag:'WEEKEND VISITS',title:'Finding Saturday and Sunday clinics in Seoul',description:'Search reported weekend hours in Gangnam-gu, Seocho-gu and the Jamsil area, and confirm reception before visiting.'},
];
export function contextualCareGuides(context:{weekend?:string;department?:string;location?:string;specialist?:boolean;registered?:boolean;stage?:'results'|'profile'|'nearby'}){
 const visit=careGuides[0],information=careGuides[1],local=careGuides[2];
 if(context.weekend==='saturday'||context.weekend==='sunday')return [careGuides[4],context.specialist||context.registered?information:visit];
 if(context.department==='dentistry')return [careGuides[3],context.specialist||context.registered?information:visit];
 const inGangnamArea=['gangnam','gangnam-station','area-seoul-gangnam-gu','area-seoul-seocho-gu'].includes(context.location||'');
 const regional=context.stage!=='nearby'&&context.department==='urology'&&inGangnamArea;
 const evidence=context.specialist||context.registered;
 return context.stage==='profile'?[visit,regional?local:information]:evidence?[information,regional?local:visit]:[visit,regional?local:information];
}
