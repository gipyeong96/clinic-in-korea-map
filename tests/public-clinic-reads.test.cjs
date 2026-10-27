const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {AsyncLocalStorage}=require('node:async_hooks');
const ts=require('typescript');
function load(file,imports={}){
 const m={exports:{}};
 new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(n=>imports[n]||require(n),m,m.exports);
 return m.exports;
}
const defaults={categorySlug:'urology',locationSlug:'guwol-dong',query:'',limit:26,offset:0,radius:1000};
function harness(read=async()=>[{id:'clinic'}],detail=async id=>({id})){
 const scope=new AsyncLocalStorage(),stored=new Map();let listCalls=0,detailCalls=0,sharedCalls=0,policy;
 const api=load('lib/public-clinic-reads.ts',{
  react:{cache:fn=>{const identity={};return (...args)=>{const context=scope.getStore();if(!context)return fn(...args);let values=context.get(identity);if(!values){values=new Map();context.set(identity,values);}const key=JSON.stringify(args);if(!values.has(key))values.set(key,fn(...args));return values.get(key);};}},
  'next/cache':{unstable_cache:(fn,keys,options)=>{policy=options;return async(...args)=>{sharedCalls++;const key=JSON.stringify([keys,args]);if(stored.has(key))return stored.get(key);const result=await fn(...args);stored.set(key,result);return result;};}},
  './supabase':{getClinics:async options=>{listCalls++;return read(options);},getClinicById:async id=>{detailCalls++;return detail(id);}},
  './urology-discovery':{urologyAreas:{'guwol-dong':{},gangnam:{}}},'./pagination':{PAGE_SIZE:25},
 });
 return {...api,request:fn=>scope.run(new Map(),fn),counts:()=>({listCalls,detailCalls,sharedCalls}),policy:()=>policy};
}
test('concurrent public comparisons share a cold read and later requests reuse public data',async()=>{
 let release;const h=harness(()=>new Promise(resolve=>{release=resolve;}));
 const pending=Array.from({length:6},()=>h.request(()=>h.getClinicListForPage({...defaults})));
 assert.equal(h.counts().listCalls,1);release([{id:'public'}]);
 for(const result of await Promise.all(pending))assert.deepEqual(result,[{id:'public'}]);
 await h.request(()=>h.getClinicListForPage(defaults));assert.equal(h.counts().listCalls,1);
 assert.equal(h.policy().revalidate,60);
});
test('equivalent option objects share only within a request for uncached searches',async()=>{
 const h=harness();const options={...defaults,query:'private-search'};
 await h.request(()=>Promise.all([h.getClinicListForPage(options),h.getClinicListForPage({...options})]));
 assert.equal(h.counts().listCalls,1);assert.equal(h.counts().sharedCalls,0);
 await h.request(()=>h.getClinicListForPage(options));assert.equal(h.counts().listCalls,2);
});
test('filters, later pages, other departments and radii never enter the shared cache',async()=>{
 const received=[],h=harness(async options=>{received.push(options);return [];});
 for(const changes of [{specialist:true},{registered:true},{offset:25},{radius:500},{categorySlug:'dentistry'},{locationSlug:'unknown'},{query:'Goldman'},{limit:10}]){
  const options={...defaults,...changes};await h.request(()=>h.getClinicListForPage(options));
  assert.equal(h.counts().sharedCalls,0);
  for(const [key,value] of Object.entries(options))assert.equal(received.at(-1)[key],value);
 }
});
test('timeouts are not retried, cached as empty results, or kept in the pending map',async()=>{
 let fail=true;const h=harness(async()=>{if(fail)throw Object.assign(new Error('timeout'),{code:'57014'});return [{id:'recovered'}];});
 const outcomes=await Promise.allSettled(Array.from({length:3},()=>h.request(()=>h.getClinicListForPage(defaults))));
 assert(outcomes.every(r=>r.status==='rejected'&&r.reason.code==='57014'));assert.equal(h.counts().listCalls,1);
 fail=false;assert.deepEqual(await h.request(()=>h.getClinicListForPage(defaults)),[{id:'recovered'}]);assert.equal(h.counts().listCalls,2);
});
test('detail metadata and body share a read, with no cross-request detail cache',async()=>{
 const h=harness();await h.request(()=>Promise.all([h.getClinicByIdForPage('clinic'),h.getClinicByIdForPage('clinic')]));
 assert.equal(h.counts().detailCalls,1);
 await h.request(()=>h.getClinicByIdForPage('clinic'));assert.equal(h.counts().detailCalls,2);
});
test('a successful empty public result stays distinct from an error',async()=>{
 const h=harness(async()=>[]);assert.deepEqual(await h.request(()=>h.getClinicListForPage(defaults)),[]);
 assert.deepEqual(await h.request(()=>h.getClinicListForPage(defaults)),[]);assert.equal(h.counts().listCalls,1);
});
