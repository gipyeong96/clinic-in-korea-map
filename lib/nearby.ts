import labels from './department-labels.json';
export const nearbyRadii=[500,1000,2000,5000];
export type NearbyOptions={department:string;radius:number;specialist:boolean;registered:boolean;query:string};
export const nearbyDepartments=[{slug:'urology',label:'Urology near me'},{slug:'dentistry',label:'Dentist near me'},{slug:'dermatology',label:'Dermatologist near me'}];
export function nearbySummary(options:NearbyOptions){return [options.department==='all'?'All departments':(labels as Record<string,string>)[options.department]||'All departments',`Within ${options.radius===500?'500 m':`${options.radius/1000} km`}`,options.specialist?'Specialists reported':null,options.registered?'International-patient registration listed':null,options.query?`Keyword: ${options.query}`:null].filter(Boolean).join(' · ');}
export function nearbyOptions(params:Record<string,string|string[]|undefined>):NearbyOptions{
 const department=typeof params.department==='string'&&Object.prototype.hasOwnProperty.call(labels,params.department)?params.department:'all';
 const radius=typeof params.radius==='string'&&nearbyRadii.includes(Number(params.radius))?Number(params.radius):1000;
 return {department,radius,specialist:params.specialist==='1',registered:params.registered==='1',query:typeof params.q==='string'?params.q.trim().slice(0,200):''};
}
export function nearbyInput(value:unknown){
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const v=value as Record<string,unknown>;
 if(typeof v.latitude!=='number'||!Number.isFinite(v.latitude)||v.latitude<33||v.latitude>39||typeof v.longitude!=='number'||!Number.isFinite(v.longitude)||v.longitude<124||v.longitude>132)return null;
 if(typeof v.radius!=='number'||!nearbyRadii.includes(v.radius))return null;
 if(typeof v.department!=='string'||(v.department!=='all'&&!Object.prototype.hasOwnProperty.call(labels,v.department)))return null;
 if(typeof v.specialist!=='boolean'||typeof v.registered!=='boolean'||typeof v.page!=='number'||!Number.isInteger(v.page)||v.page<1||v.page>10000)return null;
 if(v.query!==undefined&&(typeof v.query!=='string'||v.query.length>200))return null;
 return {latitude:v.latitude,longitude:v.longitude,radius:v.radius,department:v.department,specialist:v.specialist,registered:v.registered,page:v.page,...(typeof v.query==='string'?{query:v.query.trim()}:{})};
}
export function locationError(code:number){return code===1?'Location access was not allowed. You can enable it in your browser settings or search by station or area.':code===3?'Finding your location took too long. Try again outdoors, or search by station or area.':'Your location could not be determined. Try again, or search by station or area.';}
