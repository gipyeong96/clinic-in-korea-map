const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
function load(file,imports={}){const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(m,m.exports,n=>imports[n]||require(n));return m.exports;}
const nearby=load('lib/nearby.ts',{'./department-labels.json':require('../lib/department-labels.json')});
const input={latitude:37.4979,longitude:127.0276,radius:1000,department:'urology',specialist:true,registered:true,page:2};
test('nearby search accepts only bounded Korean coordinates and supported options',()=>{
 assert.deepEqual(nearby.nearbyInput(input),input);
 for(const change of [{latitude:NaN},{latitude:32},{longitude:133},{latitude:'37.4'},{radius:999},{department:'invalid'},{page:0},{page:1.5},{page:10001},{specialist:'1'},{registered:null}])assert.equal(nearby.nearbyInput({...input,...change}),null);
 for(const value of [null,[],0,'position'])assert.equal(nearby.nearbyInput(value),null);
 for(const radius of [500,1000,2000,5000])assert.equal(nearby.nearbyInput({...input,radius}).radius,radius);
});
test('nearby API sends validated filters before pagination and never returns success for database failure',async()=>{
 const calls=[];let fail=false;
 const api=load('app/api/nearby/route.ts',{'@/lib/nearby':nearby,'@/lib/supabase':{supabase:{rpc:async(name,args)=>{calls.push({name,args});return {data:Array.from({length:26},(_,i)=>({id:i})),error:fail?{}:null};}}},'next/server':{NextResponse:{json:(body,options)=>({body,...options})}}});
 const result=await api.POST(new Request('https://example.com/api/nearby',{method:'POST',body:JSON.stringify(input)}));assert.equal(result.body.clinics.length,25);assert.equal(result.body.hasNext,true);assert.equal(result.headers['Cache-Control'],'no-store, private');assert.equal(calls[0].args.result_offset,25);assert.equal(calls[0].args.registered_only,true);assert.equal(calls[0].args.specialist_only,true);assert.equal(calls[0].name,'nearby_location_clinics_page');
 const bad=await api.POST(new Request('https://example.com/api/nearby',{method:'POST',body:JSON.stringify({...input,longitude:0})}));assert.equal(bad.status,400);assert.equal(calls.length,1);
 fail=true;const failed=await api.POST(new Request('https://example.com/api/nearby',{method:'POST',body:JSON.stringify(input)}));assert.equal(failed.status,503);
});
test('permission denied, timeout and unavailable location have actionable fallback messages',()=>{assert.match(nearby.locationError(1),/not allowed/);assert.match(nearby.locationError(3),/too long/);assert.match(nearby.locationError(2),/station or area/);});
