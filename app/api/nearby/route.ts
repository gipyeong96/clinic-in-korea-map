import {weekendQuery} from '@/lib/weekend-query';
import {uniqueClinicProfiles} from '@/lib/site';
import {NextResponse} from 'next/server';
import {supabase} from '@/lib/supabase';
import {nearbyInput} from '@/lib/nearby';
import {searchTerms} from '@/lib/search';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store, private'};
export async function POST(request:Request){
 try{
  if(Number(request.headers.get('content-length')||0)>2048)return NextResponse.json({error:'Invalid search.'},{status:400,headers});
  const input=nearbyInput(await request.json());
  if(!input)return NextResponse.json({error:'Choose a valid location in Korea and search options.'},{status:400,headers});
  const query=searchTerms(input.query||'').join(' ');
  if(input.query&&!query)return NextResponse.json({clinics:[],hasNext:false},{headers});
  if(input.weekend){try{const data=await weekendQuery(supabase,{weekend:input.weekend,categorySlug:input.department,query,specialist:input.specialist,registered:input.registered,origins:[{latitude:input.latitude,longitude:input.longitude}],radius:input.radius,offset:(input.page-1)*25,limit:26});return NextResponse.json({clinics:uniqueClinicProfiles(data.slice(0,25)),hasNext:data.length>25},{headers});}catch{return NextResponse.json({error:'Weekend clinic data is temporarily unavailable. Please try again.'},{status:503,headers});}}
  const {data,error}=await supabase.rpc('nearby_location_clinics_page',{origin_lat:input.latitude,origin_lng:input.longitude,radius_m:input.radius,category_slug:input.department,search_query:query,specialist_only:input.specialist,registered_only:input.registered,result_limit:26,result_offset:(input.page-1)*25});
  if(error)return NextResponse.json({error:'Nearby clinics are temporarily unavailable. Please try again.'},{status:503,headers});
  return NextResponse.json({clinics:uniqueClinicProfiles((data||[]).slice(0,25)),hasNext:(data||[]).length>25},{headers});
 }catch{return NextResponse.json({error:'Unable to read this search. Please try again.'},{status:400,headers});}
}
