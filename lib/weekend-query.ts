import {unstable_cache} from 'next/cache';
import records from './weekend-hours-pilot.json';
import {filterWeekendClinics} from './weekend-search';
import {regionAddresses,scopedLocationIds} from './regions';
import {stationForSlug} from './stations';
// Cache only public directory rows, never GPS or visitor search parameters.
export async function weekendQuery(db:any,options:Parameters<typeof filterWeekendClinics>[1]&{locationSlug?:string}){
 const read=async()=>{
  const ids=Object.keys(records),rows:any[]=[];
  for(let start=0;start<ids.length;start+=200){
   const batches=[];for(let i=start;i<Math.min(ids.length,start+200);i+=50)batches.push(ids.slice(i,i+50));
   const result=await Promise.all(batches.map(batch=>unstable_cache(async()=>{
    const r=await db.from('clinics').select('*, categories!inner(*), locations!inner(*)').in('hira_code',batch).limit(100);
    if(r.error||!r.data)throw new Error('Weekend clinic data unavailable');
    return r;
   },['weekend-directory-v2',...batch],{revalidate:300})()));
   for(const r of result){if(r.error||!r.data)throw new Error('Weekend clinic data unavailable');rows.push(...r.data);}
  }
  return rows;
 };
 let rows=await read();
 const station=stationForSlug(options.locationSlug||'');
 if(station)return filterWeekendClinics(rows,{...options,origins:station.stations}).map(c=>({...c,station_name:station.name_en}));
 if(options.locationSlug&&options.locationSlug!=='all'){
  const prefixes=regionAddresses[options.locationSlug];
  if(prefixes){rows=rows.filter(c=>prefixes.some(p=>new RegExp('^'+p.split('%').map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*')).test(c.address_ko||'')));}
  else {const ids=await scopedLocationIds(db,options.locationSlug);rows=rows.filter(c=>ids.includes(c.location_id));}
 }
 return filterWeekendClinics(rows,options);
}
