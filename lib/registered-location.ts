import {cache} from 'react';
import {unstable_cache} from 'next/cache';
import {supabase} from './supabase';
import {locationHierarchyLabel,LocationNameRow} from './location-label';

const storedLabel=unstable_cache(async(slug:string)=>{
 const rows:LocationNameRow[]=[];
 let query=supabase.from('locations').select('id,parent_id,slug,name_ko,name_en').eq('slug',slug);
 for(let depth=0;depth<6;depth++){
  const {data,error}=await query.maybeSingle();
  if(error)throw new Error('Location name lookup unavailable');
  if(!data)return null;
  const row=data as LocationNameRow;
  if(rows.some(r=>r.id===row.id))return null;
  rows.push(row);
  if(row.parent_id===null)return locationHierarchyLabel(rows,slug);
  query=supabase.from('locations').select('id,parent_id,slug,name_ko,name_en').eq('id',row.parent_id);
 }
 return null;
},['scoped-location-label-v1'],{revalidate:86400});

// Request memoization shares metadata/body work. Errors are not persisted as labels.
export const registeredLocationLabel=cache(async(slug:string)=>{
 if(!new RegExp('^[\\p{L}\\p{N}-]{1,100}$','u').test(slug))return null;
 try{return await storedLabel(slug);}catch{return null;}
});
