const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
function load(file,imports={}){
 const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017,esModuleInterop:true}}).outputText;
 const module={exports:{}};new Function('require','module','exports',source)(name=>imports[name]||require(name),module,module.exports);return module.exports;
}
const site=load('lib/site.ts'),xml=load('lib/sitemap-xml.ts');
const pages=require('../lib/stations.json'),regions=load('lib/station-regions.ts').stationRegions;
test('every station belongs to exactly one crawlable region',()=>{
 for(const s of pages)assert.equal(regions.filter(r=>r.cities.includes(s.city)).length,1,s.slug);
 assert.equal(new Set(regions.map(r=>r.slug)).size,regions.length);
});
test('sitemap XML escapes URLs and uses canonical production origin',()=>{
 const s=xml.sitemapXml([site.SITE_URL+'/a?x=1&y=<test>']);
 assert(s.includes('x=1&amp;y=&lt;test&gt;'));assert(s.includes('<urlset '));
 assert(xml.sitemapXml([site.SITE_URL+'/sitemap.xml'],true).includes('<sitemapindex '));
});
function api({count=53006,data=[],error=null}={}){
 let range;
 const query={select(){return this;},order(){return this;},range(a,b){range=[a,b];return this;},then(resolve){return Promise.resolve({count,data,error}).then(resolve);}};
 return {client:{from(){return query;}},range:()=>range};
}
const imports=db=>({'@/lib/supabase':{supabase:db.client},'@/lib/site':site,'@/lib/sitemap-xml':xml,'@/lib/profile-indexing':load('lib/profile-indexing.ts')});
test('clinic index covers every API-sized page including the final partial page',async()=>{
 const db=api();const route=load('app/clinic-sitemaps.xml/route.ts',imports(db));const response=await route.GET();const body=await response.text();
 assert.equal(xml.CLINIC_SITEMAP_SIZE,1000);assert.equal((body.match(/<sitemap>/g)||[]).length,54);assert(body.includes('/clinic-sitemap-53.xml'));
});
test('clinic sitemap uses non-overlapping API ranges and exact detail canonicals',async()=>{
 const db=api({data:[{id:'uuid',hira_code:'a/b'}]});const route=load('app/clinic-sitemaps/[page]/route.ts',imports(db));
 const response=await route.GET(new Request(site.SITE_URL),{params:{page:'2.xml'}});
 assert.deepEqual(db.range(),[2000,2999]);assert((await response.text()).includes('/clinics/detail/a%2Fb'));
 assert.equal((await route.GET(new Request(site.SITE_URL),{params:{page:'-1.xml'}})).status,404);
});
test('database failures return retryable errors instead of empty successful sitemaps',async()=>{
 const db=api({error:{message:'offline'}});
 assert.equal((await load('app/clinic-sitemaps.xml/route.ts',imports(db)).GET()).status,503);
 assert.equal((await load('app/clinic-sitemaps/[page]/route.ts',imports(db)).GET(new Request(site.SITE_URL),{params:{page:'0.xml'}})).status,503);
});

 test('only the approved exact profile is excluded from search and sitemap; partners stay indexed',async()=>{
 const rule=load('lib/profile-indexing.ts');assert(rule.excludedFromSearch({hira_code:rule.excludedProfileId}));
 for(const partner of site.unifiedClinicRecords)assert.equal(rule.excludedFromSearch({id:partner.id,hira_code:partner.hira}),false);
 assert.equal(rule.excludedFromSearch({id:'other',hira_code:'unrelated',name_ko:'잠실서울비뇨의학과의원'}),false);
 const db=api({data:[{id:'excluded',hira_code:rule.excludedProfileId},{id:'keep',hira_code:'keep-me'}]});
 const body=await(await load('app/clinic-sitemaps/[page]/route.ts',imports(db)).GET(new Request(site.SITE_URL),{params:{page:'0.xml'}})).text();
 assert(!body.includes(rule.excludedProfileId));assert(body.includes('keep-me'));
 });
