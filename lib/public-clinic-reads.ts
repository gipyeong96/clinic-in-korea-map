import {cache} from 'react';
import {unstable_cache} from 'next/cache';
import {getClinics,getClinicById} from './supabase';
import {urologyAreas} from './urology-discovery';
import {PAGE_SIZE} from './pagination';

// Request lifetime only: metadata and body share one detail read, including failures.
export const getClinicByIdForPage=cache((id:string)=>getClinicById(id,{throwOnError:true}));

// Only finite, public, unfiltered first-page comparisons use a shared data cache.
// Search terms, filters, later pages and GPS never enter it. Failures throw rather
// than becoming cached empty lists. A failed refresh retains the last good data.
const publicList=unstable_cache(async(location:string)=>getClinics({
 categorySlug:'urology',locationSlug:location,query:'',specialist:false,
 registered:false,limit:PAGE_SIZE+1,offset:0,radius:1000,
}),['public-urology-list-v1'],{revalidate:60});
const pending=new Map<string,Promise<any[]>>();
function sharedPublicList(location:string){
 const existing=pending.get(location);if(existing)return existing;
 const read=publicList(location).finally(()=>pending.delete(location));
 pending.set(location,read);return read;
}
const forRequest=cache(async(key:string)=>{
 const [categorySlug,locationSlug,query,specialist,registered,limit,offset,radius]=JSON.parse(key);
 if(categorySlug==='urology'&&Object.hasOwn(urologyAreas,locationSlug)&&!query&&!specialist&&!registered&&limit===PAGE_SIZE+1&&offset===0&&radius===1000){
  return sharedPublicList(locationSlug);
 }
 return getClinics({categorySlug,locationSlug,query,specialist,registered,limit,offset,radius});
});
export function getClinicListForPage(options:NonNullable<Parameters<typeof getClinics>[0]>){
 // Primitive key also coalesces callers that construct equivalent option objects.
 return forRequest(JSON.stringify([options.categorySlug||'all',options.locationSlug||'all',
  options.query||'',!!options.specialist,!!options.registered,options.limit||100,
  options.offset||0,options.radius||1000]));
}
