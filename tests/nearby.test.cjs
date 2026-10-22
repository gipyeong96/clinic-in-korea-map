const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
function load(file,imports={}){const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(m,m.exports,n=>imports[n]||require(n));return m.exports;}
const nearby=load('lib/nearby.ts',{'./department-labels.json':require('../lib/department-labels.json')});
const search=load('lib/search.ts',{'./regions':{extractRegion:()=>null}});
const input={latitude:37.4979,longitude:127.0276,radius:1000,department:'urology',specialist:true,registered:true,page:2};
test('nearby empty actions change one option, reset pagination and never copy coordinates',()=>{
 const initial={...input,query:'missing'};const actions=nearby.nearbyRecovery(initial);
 assert.equal(actions.find(a=>a.label.startsWith('Expand radius')).changes.radius,2000);
 assert.equal(actions.find(a=>a.label==='Remove keyword').changes.query,'');
 assert.equal(actions.find(a=>a.label==='Remove registration filter').changes.registered,false);
 assert.equal(actions.find(a=>a.label==='Remove specialist filter').changes.specialist,false);
 for(const action of actions){assert.equal(action.changes.page,1);assert(Object.keys(action.changes).length<=2);assert(!('latitude' in action.changes));assert(!('longitude' in action.changes));const next={...initial,...action.changes};if(!('department' in action.changes))assert.equal(next.department,'urology');if(!('radius' in action.changes))assert.equal(next.radius,1000);}
 assert.deepEqual(nearby.nearbyRecovery({department:'all',radius:5000,specialist:false,registered:false,query:'',page:1}),[]);
 assert.equal(nearby.nearbyRecovery({...initial,radius:2000}).find(a=>a.label.startsWith('Expand radius')).changes.radius,5000);
});
test('nearby search accepts only bounded Korean coordinates and supported options',()=>{
 assert.deepEqual(nearby.nearbyInput(input),input);
 for(const change of [{latitude:NaN},{latitude:32},{longitude:133},{latitude:'37.4'},{radius:999},{department:'invalid'},{page:0},{page:1.5},{page:10001},{specialist:'1'},{registered:null}])assert.equal(nearby.nearbyInput({...input,...change}),null);
 for(const value of [null,[],0,'position'])assert.equal(nearby.nearbyInput(value),null);
 for(const radius of [500,1000,2000,5000])assert.equal(nearby.nearbyInput({...input,radius}).radius,radius);
});
test('nearby API sends validated filters before pagination and never returns success for database failure',async()=>{
 const calls=[];let fail=false;
 const api=load('app/api/nearby/route.ts',{'@/lib/site':load('lib/site.ts'),'@/lib/nearby':nearby,'@/lib/search':search,'@/lib/supabase':{supabase:{rpc:async(name,args)=>{calls.push({name,args});return {data:Array.from({length:26},(_,i)=>({id:i})),error:fail?{}:null};}}},'next/server':{NextResponse:{json:(body,options)=>({body,...options})}}});
 const result=await api.POST(new Request('https://example.com/api/nearby',{method:'POST',body:JSON.stringify(input)}));assert.equal(result.body.clinics.length,25);assert.equal(result.body.hasNext,true);assert.equal(result.headers['Cache-Control'],'no-store, private');assert.equal(calls[0].args.result_offset,25);assert.equal(calls[0].args.registered_only,true);assert.equal(calls[0].args.specialist_only,true);assert.equal(calls[0].name,'nearby_location_clinics_page');
 const bad=await api.POST(new Request('https://example.com/api/nearby',{method:'POST',body:JSON.stringify({...input,longitude:0})}));assert.equal(bad.status,400);assert.equal(calls.length,1);
 fail=true;const failed=await api.POST(new Request('https://example.com/api/nearby',{method:'POST',body:JSON.stringify(input)}));assert.equal(failed.status,503);
});
test('permission denied, timeout and unavailable location have actionable fallback messages',()=>{assert.match(nearby.locationError(1),/not allowed/);assert.match(nearby.locationError(3),/too long/);assert.match(nearby.locationError(2),/station or area/);});

test('nearby URL context keeps only valid filters and never restores page or coordinates',()=>{
 assert.deepEqual(nearby.nearbyOptions({department:'urology',specialist:'1',registered:'1',radius:'500',q:' Goldman ',page:'5',latitude:'37.5',longitude:'127'}),{department:'urology',specialist:true,registered:true,radius:500,query:'Goldman'});
 assert.deepEqual(nearby.nearbyOptions({department:'../../invalid',specialist:['1'],registered:'true',radius:['500'],q:['a','b']}),{department:'all',specialist:false,registered:false,radius:1000,query:''});
 assert.equal(nearby.nearbyOptions({q:'x'.repeat(250)}).query.length,200);
 assert.equal(nearby.nearbyInput({...input,query:42}),null);assert.equal(nearby.nearbyInput({...input,query:'x'.repeat(201)}),null);
});

test('nearby keyword filtering reaches the existing RPC before pagination without wildcard broadening',async()=>{
 const calls=[];
 const api=load('app/api/nearby/route.ts',{'@/lib/site':load('lib/site.ts'),'@/lib/nearby':nearby,'@/lib/search':search,'@/lib/supabase':{supabase:{rpc:async(name,args)=>{calls.push(args);return {data:[],error:null};}}},'next/server':{NextResponse:{json:(body,options)=>({body,...options})}}});
 const post=query=>api.POST(new Request('https://example.com/api/nearby',{method:'POST',body:JSON.stringify({...input,query})}));
 await post('Goldman,% 치과');assert.equal(calls[0].search_query,'Goldman 치과');assert.equal(calls[0].specialist_only,true);assert.equal(calls[0].registered_only,true);assert.equal(calls[0].result_offset,25);
 const empty=await post('%%%_*');assert.deepEqual(empty.body,{clinics:[],hasNext:false});assert.equal(calls.length,1);
});
