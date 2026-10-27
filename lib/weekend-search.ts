import {matchesClassification,matchesSpecialist} from './clinic-classification';
import {weekendHours,hoursLabel} from './weekend-hours';
import {registeredEvidence} from './clinic-evidence';
import {searchTerms} from './search';
export function weekendDay(value:unknown):'saturday'|'sunday'|undefined{return value==='saturday'||value==='sunday'?value:undefined;}
export function distanceMeters(lat:number,lng:number,toLat:number,toLng:number){
 const rad=(v:number)=>v*Math.PI/180;
 const a=Math.sin(rad(toLat-lat)/2)**2+Math.cos(rad(lat))*Math.cos(rad(toLat))*Math.sin(rad(toLng-lng)/2)**2;
 return 6371000*2*Math.asin(Math.sqrt(Math.min(1,a)));
}
export function filterWeekendClinics(rows:any[],options:{weekend:string;categorySlug?:string;query?:string;specialist?:boolean;registered?:boolean;origins?:{latitude:number;longitude:number}[];radius?:number;offset?:number;limit?:number}){
 const day=weekendDay(options.weekend);if(!day)return [];
 const terms=searchTerms(options.query||'');if(options.query?.trim()&&!terms.length)return [];
 const result=rows.filter(c=>{
  const evidence=weekendHours(c.hira_code||'',c.name_ko||'',c.address_ko||'',c.telephone||'');
  if(!evidence||hoursLabel(evidence[day])==='Hours not provided')return false;
  if(!matchesClassification(c,options.categorySlug))return false;
  if(options.specialist&&!matchesSpecialist(c,options.categorySlug))return false;
  if(options.registered&&!registeredEvidence(c))return false;
  return terms.every(t=>[c.name_en,c.name_ko,c.address_en,c.address_ko].some(v=>typeof v==='string'&&v.toLowerCase().includes(t.toLowerCase())));
 }).map(c=>{
  if(!options.origins)return c;
  const valid=typeof c.latitude==='number'&&typeof c.longitude==='number'&&c.latitude>=33&&c.latitude<=39&&c.longitude>=124&&c.longitude<=132&&!(c.latitude===37.5665&&c.longitude===126.978);
  return {...c,distance_m:valid?Math.min(...options.origins.map(o=>distanceMeters(o.latitude,o.longitude,c.latitude,c.longitude))):Infinity};
 }).filter(c=>!options.origins||c.distance_m<=(options.radius||1000));
 result.sort((a,b)=>options.origins?a.distance_m-b.distance_m||String(a.id).localeCompare(String(b.id)):Number(!!b.is_premium)-Number(!!a.is_premium)||String(a.id).localeCompare(String(b.id)));
 return result.slice(options.offset||0,(options.offset||0)+(options.limit||100)).map(c=>({...c,weekend_label:`${day==='saturday'?'Saturday':'Sunday'} ${hoursLabel(weekendHours(c.hira_code,c.name_ko,c.address_ko,c.telephone)![day])} · reported schedule`}));
}
