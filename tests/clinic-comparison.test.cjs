const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
function load(file,imports={}){const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(m,m.exports,n=>imports[n]||require(n));return m.exports;}
const contact=load('lib/clinic-contact.ts'),evidence=load('lib/clinic-evidence.ts');
const comparison=load('lib/clinic-comparison.ts',{'./clinic-contact':contact,'./clinic-evidence':evidence,'./site':{clinicPath:c=>`/clinics/detail/${encodeURIComponent(c.hira_code||c.id)}`}});
test('comparison accepts only two or three distinct bounded provider identifiers',()=>{
 for(const ids of [['a','b'],['goldman-jamsil','hira_123','UUID-3']])assert.deepEqual(comparison.comparisonIds({ids}),ids);
 for(const ids of [[],['a'],['a','b','c','d'],['a','a'],['a','../b'],['a','b%2fc'],['a',4],['a','x'.repeat(201)]])assert.equal(comparison.comparisonIds({ids}),null);
 for(const value of [null,[],{},'a'])assert.equal(comparison.comparisonIds(value),null);
});
test('premium marketing fields never become verified department or registration evidence',()=>{
 const profile=comparison.comparisonProfile({id:'premium',name_en:'Clinic',is_premium:true,specialist_count:10,departments:[{slug:'urology',name_en:'Urology',specialist_count:10}],foreign_patient_registration:{status:'listed'},telephone:'javascript:alert(1)'});
 assert.deepEqual(profile.departments,[]);assert.equal(profile.departmentSource,null);assert.equal(profile.registration,null);assert.equal(profile.phone.href,null);
});
test('confirmed department-specific counts and registry dates survive projection without unrelated data',()=>{
 const p=comparison.comparisonProfile({id:'clinic',name_en:'Clinic',department_source:'HIRA',departments:[{slug:'urology',name_en:'Urology',specialist_count:2},{slug:'dermatology',name_en:'Dermatology',specialist_count:0}],foreign_patient_registration:{status:'listed',source_date:'2026-01-01',checked_at:'2026-10-01'},telephone:'02-555-7900',secret:'never send'});
 assert.deepEqual(p.departments,[{name:'Urology',specialists:2},{name:'Dermatology',specialists:0}]);assert.equal(p.registration.date,'2026-01-01');assert.equal(p.phone.href,'tel:+8225557900');assert.equal(p.secret,undefined);
});
test('comparison validates before lookup and preserves partial failures, order and no-store',async()=>{
 const calls=[];const api=load('app/api/clinics/compare/route.ts',{'@/lib/clinic-comparison':comparison,'@/lib/goldman':{additionalGoldmanClinic:()=>null},'@/lib/supabase':{getClinicById:async id=>{calls.push(id);if(id==='error')throw Error();return id==='missing'?null:{id,name_en:id};}},'next/server':{NextResponse:{json:(body,options)=>({body,...options})}}});
 const post=body=>api.POST(new Request('https://example.com/api/clinics/compare',{method:'POST',body}));
 for(const body of ['{',JSON.stringify({ids:['a']}),'x'.repeat(2049)])assert.equal((await post(body)).status,400);
 assert.equal(calls.length,0);
 const r=await post(JSON.stringify({ids:['found','missing','error']}));assert.deepEqual(r.body.rows.map(v=>[v.id,v.status]),[['found','ok'],['missing','missing'],['error','error']]);assert.equal(r.headers['Cache-Control'],'no-store, private');assert.ok(Date.parse(r.body.loadedAt));assert.equal(calls.length,3);
 const two=await post(JSON.stringify({ids:['a','b']}));assert.equal(two.body.rows.length,2);
});
