const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createClient}=require('@supabase/supabase-js');
const config=fs.readFileSync('lib/supabase.ts','utf8');
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || config.match(/supabaseUrl = .*?\|\| '([^']+)'/)[1],process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || config.match(/supabaseAnonKey = .*?\|\| '([^']+)'/)[1]);
async function main(){
 const registered=await db.from('clinics').select('id,name_ko,foreign_patient_registration').not('foreign_patient_registration','is',null).limit(5);
 assert.ifError(registered.error);assert(registered.data.length>0);
 registered.data.forEach(c=>{assert.equal(c.foreign_patient_registration.status,'listed');assert.equal(c.foreign_patient_registration.source_date,'2026-07-21');assert.equal(c.foreign_patient_registration.english_possible,undefined);});
 const pediatric=await db.from('clinics').select('id,name_ko,departments,categories(*),department_source').eq('name_ko','튼튼소아과의원').like('address_ko','서울특별시 은평구 %').single();
 assert.ifError(pediatric.error);assert.equal(pediatric.data.categories.slug,'pediatrics');assert(pediatric.data.departments.some(d=>d.slug==='pediatrics'));
 const specialist=await db.from('clinics').select('id,departments').contains('departments',JSON.stringify([{slug:'urology'}])).contains('specialist_slugs',['urology']).limit(100);
 assert.ifError(specialist.error);assert(specialist.data.length>0);assert(specialist.data.every(c=>c.departments.some(d=>d.slug==='urology' && d.specialist_count>0)));
 const near=await db.rpc('nearby_clinics',{station_ids:['seoulmetro-2-222'],category_slug:'urology',specialist_only:true,radius_m:2000});
 assert.ifError(near.error);assert(near.data.length>0);assert(near.data.every(c=>c.departments.some(d=>d.slug==='urology' && d.specialist_count>0)));
 console.log(JSON.stringify({registeredExample:registered.data[0].id,pediatricFocusCorrect:true,specialistRecords:specialist.data.length,nearbyUrologySpecialists:near.data.length}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
