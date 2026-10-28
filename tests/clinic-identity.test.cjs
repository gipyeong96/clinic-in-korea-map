const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
function load(file,imports={}){const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(m,m.exports,n=>imports[n]||require(n));return m.exports;}
const site=load('lib/site.ts'),goldman=load('lib/goldman.ts',{'./site':site}),google=load('lib/goldman-google.ts',{'./site':site});
test('exact verified aliases share canonical paths, branch guides and Google place IDs, never similar names',()=>{
 const all=[];for(const record of site.unifiedClinicRecords){
  for(const id of [record.id,...record.aliases,record.hira]){
   all.push(id);assert.equal(site.canonicalClinicId(id),record.id);assert.equal(site.clinicPath({id}),`/clinics/detail/${record.id}`);assert.equal(goldman.goldmanBranch(id).id,record.id);assert.equal(google.goldmanGooglePlace(id).placeId,google.goldmanGooglePlace(record.id).placeId);
  }
 }
 assert.equal(new Set(all).size,all.length);
 for(const id of ['5b513ee9-5f7c-43c4-af7c-25b19bdb43fe','goldman-other','Goldman Urology Clinic','__proto__']){assert.equal(site.canonicalClinicId(id),id);assert.equal(goldman.goldmanBranch(id),undefined);assert.equal(google.goldmanGooglePlace(id),undefined);}
});
test('all known detail identifiers resolve the same public evidence and verified branch contact without DB mutation',async()=>{
 let current='',fail=false;const calls=[];
 const client={from:table=>{assert.equal(table,'clinics');return {select:()=>({eq:(field,value)=>{calls.push([field,value]);current=value;return {single:async()=>fail?{data:null,error:{}}:{data:{id:'public-record',hira_code:current,department_source:{provider:'HIRA',as_of:'2026-06-30'},departments:[{slug:'urology',name_en:'Urology',specialist_count:3}],foreign_patient_registration:{status:'listed',source_date:'2026-07-21'},telephone:'incomplete',name_en:'generic source name'},error:null}};}})};}};
 const api=load('lib/supabase.ts',{'./clinic-list-select':load('lib/clinic-list-select.ts'),'./search':{},'./regions':{},'./stations':{},'./site':site,'./goldman':goldman,'@supabase/supabase-js':{createClient:()=>client}});
 for(const record of site.unifiedClinicRecords){
  for(const id of [record.id,...record.aliases,record.hira]){const c=await api.getClinicById(id);assert.equal(c.id,record.id);assert.equal(c.telephone,goldman.goldmanBranch(record.id).phone);assert.equal(c.departments[0].specialist_count,3);assert.equal(c.department_source.provider,'HIRA');assert.equal(c.premium_data.website,goldman.GOLDMAN_ENGLISH_URL);assert.deepEqual(calls.at(-1),['hira_code',record.hira]);}
 }
 fail=true;const fallback=await api.getClinicById('goldman-gangnam');assert.equal(fallback.department_source,undefined);assert.equal(fallback.departments,undefined);assert.equal(fallback.telephone,'02-556-7533');
 await assert.rejects(api.getClinicById('goldman-gangnam',{throwOnError:true}),/Unable to refresh clinic profile/);
 await assert.rejects(api.getClinicById('unknown-profile',{throwOnError:true}),/Unable to refresh clinic profile/);
});

test('edge redirects preserve all existing identities without consuming the navigation query',async()=>{
 const config=require('../next.config.js');const redirects=await config.redirects();
 const expected=site.unifiedClinicRecords.flatMap(r=>[...r.aliases,r.hira].map(id=>({source:'/clinics/detail/'+id,destination:'/clinics/detail/'+r.id,permanent:true})));
 assert.deepEqual(redirects.filter(r=>r.source.startsWith('/clinics/detail/')),expected);
 assert(redirects.some(r=>r.source==='/en/:path*'));assert(redirects.some(r=>r.source==='/mn/:path*'));
 // No query in destination: Next forwards existing returnTo automatically.
 assert(expected.every(r=>!r.destination.includes('?')));
});

test('same-page dedup prefers HIRA evidence while preserving first anchor, order, other clinics and source input',()=>{
 const record=site.unifiedClinicRecords[0],managed={id:record.aliases[0],name_en:'Gangnam',department_source:{provider:'Clinic-managed profile'},departments:[{specialist_count:2}]},publicRecord={id:record.aliases[2],hira_code:record.hira,name_en:'Generic',department_source:{provider:'HIRA'},departments:[{specialist_count:4}]},other={id:'other'};
 const raw=[managed,other,publicRecord];const before=JSON.stringify(raw);const rows=site.uniqueClinicProfiles(raw);
 assert.equal(rows.length,2);assert.equal(rows[0].id,managed.id);assert.equal(rows[0].name_en,'Gangnam');assert.equal(rows[0].departments[0].specialist_count,4);assert.equal(rows[1],other);assert.equal(JSON.stringify(raw),before);
 assert.equal(site.uniqueClinicProfiles([publicRecord,managed])[0].department_source.provider,'HIRA');assert.equal(site.uniqueClinicProfiles([managed,{id:'goldman-jamsil'}]).length,2);
});
