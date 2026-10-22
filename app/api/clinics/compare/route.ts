import {NextResponse} from 'next/server';
import {getClinicById} from '@/lib/supabase';
import {comparisonIds,comparisonProfile,ComparisonRow} from '@/lib/clinic-comparison';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store, private'};
export async function POST(request:Request){
 let ids:string[]|null;
 try{const body=await request.text();if(body.length>2048)return NextResponse.json({error:'Choose two or three clinics.'},{status:400,headers});ids=comparisonIds(JSON.parse(body));}catch{return NextResponse.json({error:'Unable to read this comparison.'},{status:400,headers});}
 if(!ids)return NextResponse.json({error:'Choose two or three different clinics.'},{status:400,headers});
 const rows:ComparisonRow[]=await Promise.all(ids.map(async id=>{
  try{const clinic=await getClinicById(id);return clinic?{id,status:'ok' as const,profile:comparisonProfile(clinic)}:{id,status:'missing' as const};}
  catch{return {id,status:'error' as const};}
 }));
 return NextResponse.json({rows,loadedAt:new Date().toISOString()},{headers});
}
