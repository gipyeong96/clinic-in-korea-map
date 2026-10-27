import {CLINIC_LIST_SELECT} from './clinic-list-select';
import {unstable_cache} from 'next/cache';
import records from './weekend-hours-pilot.json';
import {filterWeekendClinics,weekendDay} from './weekend-search';
import {hoursLabel} from './weekend-hours';
import {regionAddresses,scopedLocationIds} from './regions';
import {stationForSlug} from './stations';
// Cache only public directory rows, never GPS or visitor search parameters.
export async function weekendQuery(db:any,options:Parameters<typeof filterWeekendClinics>[1]&{locationSlug?:string}){
 const day=weekendDay(options.weekend);if(!day)return [];
 const station=stationForSlug(options.locationSlug||'');
 const prefixes=!station?regionAddresses[options.locationSlug||'']:undefined;
 const matchesAddress=(address:string)=>!prefixes||prefixes.some(p=>new RegExp('^'+p.split('%').map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*')).test(address));
 const read=async()=>{
  const ids=Object.entries(records).filter(([,r])=>hoursLabel(r[day])!=='Hours not provided'&&matchesAddress(r.address)).map(([id])=>id),rows:any[]=[];
  for(let start=0;start<ids.length;start+=400){
   const batches=[];for(let i=start;i<Math.min(ids.length,start+400);i+=50)batches.push(ids.slice(i,i+50));
   const result=await Promise.all(batches.map(batch=>unstable_cache(async()=>{
    const r=await db.from('clinics').select(CLINIC_LIST_SELECT).in('hira_code',batch).limit(100);
    if(r.error||!r.data)throw new Error('Weekend clinic data unavailable');
    return r;
   },['weekend-directory-v3',...batch],{revalidate:300})()));
   for(const r of result){if(r.error||!r.data)throw new Error('Weekend clinic data unavailable');rows.push(...r.data);}
  }
  return rows;
 };
 let rows=await read();
 if(station)return filterWeekendClinics(rows,{...options,origins:station.stations}).map(c=>({...c,station_name:station.name_en}));
 if(options.locationSlug&&options.locationSlug!=='all'){
  if(prefixes){rows=rows.filter(c=>matchesAddress(c.address_ko||''));}
  else {const ids=await scopedLocationIds(db,options.locationSlug);rows=rows.filter(c=>ids.includes(c.location_id));}
 }
 return filterWeekendClinics(rows,options);
}
