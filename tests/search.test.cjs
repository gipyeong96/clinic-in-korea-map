const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file, imports = {}) {
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', source)((name) => imports[name] || require(name), module, module.exports);
  return module.exports;
}
const national=load('lib/national-regions.ts',{'./national-areas.json':JSON.parse(fs.readFileSync(path.join(__dirname,'../lib/national-areas.json'),'utf8'))});
const regions = load('lib/regions.ts',{'./national-regions':national});
const search = load('lib/search.ts',{'./regions':regions});
const site = load('lib/site.ts');
const evidence = load('lib/clinic-evidence.ts');
const stations = load('lib/stations.ts', { './stations.json': JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/stations.json'), 'utf8')) });
const pagination=load('lib/pagination.ts');
const recovery=load('lib/search-recovery.ts',{'./search':search,'./department-labels.json':require('../lib/department-labels.json'),'./area-navigation':load('lib/area-navigation.ts',{'./search':search,'./department-labels.json':require('../lib/department-labels.json')})});

test('empty alternatives name the department/area and preserve context when choosing another area',()=>{
 const input={department:'dermatology',location:'busan',query:'no-such-clinic',specialist:true,registered:true,page:1,departmentLabel:'Dermatology',locationLabel:'Busan'};
 const alternatives=recovery.searchRecovery(input),browse=alternatives.find(a=>a.label==='Clear keyword');
 assert.equal(browse.title,'Browse Dermatology in Busan');assert.match(browse.description,/no-such-clinic/);
 const clean=new URL(browse.href,'https://example.com');assert.equal(clean.pathname,'/clinics/dermatology/busan');assert.equal(clean.searchParams.get('q'),null);assert.equal(clean.searchParams.get('registered'),'1');assert.equal(clean.searchParams.get('specialist'),'1');
 const area=new URL(alternatives.find(a=>a.label==='Choose another area').href,'https://example.com');assert.equal(area.pathname,'/areas');for(const [key,value] of [['department','dermatology'],['q','no-such-clinic'],['registered','1'],['specialist','1']])assert.equal(area.searchParams.get(key),value);
 const interpreted=recovery.searchRecovery({...input,department:'all',query:'skin doctor evening'}).find(a=>a.label==='Search the named department');
 const url=new URL(interpreted.href,'https://example.com');assert.equal(url.pathname,'/clinics/dermatology/busan');assert.equal(url.searchParams.get('q'),'evening');assert.equal(url.searchParams.get('specialist'),'1');
 assert(!recovery.searchRecovery({...input,department:'all',query:'rash'}).some(a=>a.label==='Search the named department'));
});
const active=load('lib/active-filters.ts',{'./search':search});

test('plain English clinician phrases route to departments and retain locations and unrelated keywords',()=>{
 for(const [phrase,department] of [['skin doctor','dermatology'],['skin-clinic','dermatology'],['eye doctors','ophthalmology'],["children’s doctor",'pediatrics'],['kids clinic','pediatrics'],['ear nose and throat doctor','ent'],['paediatrician','pediatrics'],['gynecologist','ob-gyn']]){
  assert.equal(search.homeSearchPath(phrase+' in Busan'),`/clinics/${department}/busan`);
 }
 assert.equal(search.homeSearchPath('Goldman skin doctor in Busan evening'),'/clinics/dermatology/busan?q=goldman%20evening');
 assert.equal(search.homeSearchPath('skin doctor walk in Busan'),'/clinics/dermatology/busan?q=walk%20in');
 assert.equal(search.homeSearchPath('eye doctor near me'),'/nearby?department=ophthalmology');
 assert.equal(search.homeSearchPath('kids doctor nearby weekend'),'/nearby?department=pediatrics&q=weekend');
 for(const input of ['rash busan','eye pain busan','skinny doctor busan'])assert.equal(new URL(search.homeSearchPath(input),'https://example.com').pathname,'/clinics/all/busan');
});

test('compact active-search summary describes every applied condition without changing URLs',()=>{
 const input={department:'dermatology',location:'gangnam-station',query:'evening',specialist:true,registered:true,radius:500,departmentLabel:'Dermatology',locationLabel:'Gangnam Station'};
 const before=JSON.stringify(input),summary=active.activeSearchSummary(input);
 for(const part of ['Dermatology','Gangnam Station','Within 500 m','Specialists reported','International-patient registration listed','Keyword: evening'])assert(summary.includes(part));
 assert.equal(JSON.stringify(input),before);assert.equal(active.activeSearchSummary({...input,department:'all',location:'all',query:'',specialist:false,registered:false,radius:undefined}),'All departments · Across Korea');
});

test('active filter removals preserve unrelated conditions and reset pagination',()=>{
 const {filters,clear}=active.activeFilters({department:'dentistry',location:'seoul-station',query:'치과',specialist:true,radius:1000,departmentLabel:'Dentistry',locationLabel:'Seoul Station'});
 assert.equal(filters.length,5);assert.equal(clear,'/clinics/all/all');
 const byAction=action=>new URL(filters.find(f=>f.action===action).href,'https://example.com');
 assert.equal(byAction('Remove department').pathname,'/clinics/all/seoul-station');assert.equal(byAction('Remove department').searchParams.get('specialist'),'1');assert.equal(byAction('Remove department').searchParams.get('q'),'치과');
 assert.equal(byAction('Remove keyword').searchParams.get('q'),null);assert.equal(byAction('Remove keyword').searchParams.get('radius'),'1000');
 assert.equal(byAction('Remove specialist filter').searchParams.get('specialist'),null);assert.equal(byAction('Remove specialist filter').searchParams.get('q'),'치과');
 assert.equal(byAction('Remove location').pathname,'/clinics/dentistry/all');assert.equal(byAction('Remove location').searchParams.get('radius'),null);
 assert.equal(filters.find(f=>f.action==='Change radius').href,'#search-radius');
 for(const f of filters)assert.equal(new URL(f.href,'https://example.com').searchParams.has('page'),false);
 assert.equal(active.activeFilters({department:'all',location:'all',query:'',specialist:false,departmentLabel:'Medical',locationLabel:'Korea'}).filters.length,0);
});
test('home search recognizes department/location but retains all other search terms', () => {
  assert.equal(search.homeSearchPath('Dentist Gangnam'), '/clinics/dentistry/gangnam');
  assert.equal(search.homeSearchPath('Goldman urology Seoul Station'), '/clinics/urology/seoul-station?q=goldman');
  assert.equal(search.homeSearchPath('dentist Seoul'), '/clinics/dentistry/seoul');
  assert.equal(search.homeSearchPath('zzzz-no-such-clinic'), '/clinics/all/all?q=zzzz-no-such-clinic');
  assert.equal(search.homeSearchPath(''), '/clinics/all/all');
  assert.equal(search.homeSearchPath('Gangnam unknownword'), '/clinics/all/gangnam?q=unknownword');
});

test('near-me intent routes to explicit location consent with department and extra terms intact',()=>{
 assert.equal(search.homeSearchPath('UROLOGY NEAR ME'),'/nearby?department=urology');
 assert.equal(search.homeSearchPath('dentist near-me'),'/nearby?department=dentistry');
 assert.equal(search.homeSearchPath('clinics around me'),'/nearby');
 assert.equal(search.homeSearchPath('Goldman urologist near me'),'/nearby?department=urology&q=goldman');
 assert.equal(search.homeSearchPath('nearby dermatology'),'/nearby?department=dermatology');
 for(const phrase of ['Near Memorial Clinic','near medicine','nearmeadow'])assert.equal(search.hasNearMeIntent(phrase),false);
 const handoff=new URL(search.nearbySearchLink('ent',{query:'서울 & clinic',specialist:true,registered:true,radius:500,page:4}),'https://example.com');
 assert.equal(handoff.pathname,'/nearby');assert.equal(handoff.searchParams.get('q'),'서울 & clinic');assert.equal(handoff.searchParams.get('department'),'ent');assert.equal(handoff.searchParams.get('specialist'),'1');assert.equal(handoff.searchParams.get('registered'),'1');assert.equal(handoff.searchParams.get('radius'),'500');assert(!handoff.searchParams.has('page'));assert(!handoff.searchParams.has('location'));assert(!handoff.searchParams.has('latitude'));
});
test('text search does not accept PostgREST syntax or wildcard-only queries', () => {
  assert.deepEqual(search.searchTerms('%%_*,()."\\'), []);
  assert.deepEqual(search.searchTerms('강남 Goldman'), ['강남', 'Goldman']);
});

test('nationwide aliases use qualified jurisdictions and preserve other keywords',()=>{
  assert.equal(national.nationalProvinces.length,17);assert.equal(national.nationalAreas.length,267);
  assert.equal(new Set(national.nationalAreas.map(a=>a.slug)).size,267);
  for(const [q,expected] of [['Chuncheon','area-gangwon-chuncheon-si'],['전주','area-jeonbuk-jeonju-si'],['Gimhae','area-gyeongnam-gimhae-si'],['Seoul Jung-gu','area-seoul-jung-gu'],['Gangwon Goseong','area-gangwon-goseong-gun'],['Gyeongnam 고성군','area-gyeongnam-goseong-gun'],['Bundang-gu','area-gyeonggi-seongnam-si-bundang-gu'],['Sejong','sejong']])assert.equal(regions.extractRegion(q)?.slug,expected,q);
  for(const area of national.nationalAreas){
    const parent='parent' in area?national.nationalAreas.find(p=>p.province===area.province&&p.ko===area.parent)?.en:'';
    const q=`${area.province} ${parent||''} ${area.en}`;
    const result=regions.extractRegion(q);assert.equal(result?.slug,area.slug,q);assert.equal(result?.query,'',q);
    const korean=`${national.nationalProvinces.find(p=>p.slug===area.province).ko} ${'parent' in area?area.parent:''} ${area.ko}`;
    assert.equal(regions.extractRegion(korean)?.slug,area.slug,korean);
  }
  assert.equal(regions.extractRegion('Gangwon Chuncheon Goldman')?.query,'Goldman');
  assert.equal(regions.extractRegion('notchuncheon'),null);
  assert.equal(regions.extractRegion('Chuncheon station'),null);
});

test('homonymous districts require a choice and Gwangju never includes all Jeonnam',()=>{
  const goseong=national.matchRegions('Goseong clinic');assert.equal(goseong.options.length,2);assert.equal(goseong.query,'clinic');
  assert(national.matchRegions('Jung-gu').options.length>2);
  assert.equal(regions.extractRegion('Gwangju')?.slug,'gwangju');assert.equal(regions.extractRegion('Gyeonggi Gwangju-si')?.slug,'gyeonggi-gwangju');
  assert(!regions.regionAddresses.gwangju.includes('전남광주통합특별시 '));
  assert(regions.regionAddresses.gwangju.includes('전남광주통합특별시 광산구 '));
  assert(!regions.regionAddresses.gwangju.some(x=>x.includes('목포')));
  assert(regions.regionAddresses['area-jeonnam-mokpo-si'].includes('전남광주통합특별시 목포시 '));
});

test('empty result suggestions relax one condition and preserve all others',()=>{
  const original={department:'dentistry',location:'gangnam-station',query:'Goldman',specialist:true,radius:500,page:3};
  const links=recovery.searchRecovery(original);const url=label=>new URL(links.find(x=>x.label===label).href,'https://example.com');
  assert.equal(url('Expand radius to 1 km').searchParams.get('radius'),'1000');
  assert.equal(url('Expand radius to 1 km').searchParams.get('specialist'),'1');
  assert.equal(url('Expand radius to 1 km').searchParams.get('q'),'Goldman');
  assert(!url('Remove specialist filter').searchParams.has('specialist'));assert.equal(url('Remove specialist filter').searchParams.get('radius'),'500');
  assert.equal(url('Search all departments').pathname,'/clinics/all/gangnam-station');assert.equal(url('Search all departments').searchParams.get('specialist'),'1');
  assert(!url('Clear keyword').searchParams.has('q'));assert.equal(url('Clear keyword').searchParams.get('specialist'),'1');
  for(const link of links)assert(!new URL(link.href,'https://example.com').searchParams.has('page'));
  assert(!recovery.searchRecovery({...original,radius:2000}).some(x=>x.label.startsWith('Expand')));
  assert.deepEqual(original,{department:'dentistry',location:'gangnam-station',query:'Goldman',specialist:true,radius:500,page:3});
});

test('Gyeonggi city aliases preserve remaining words and distinguish homonyms',()=>{
  for(const q of ['uiwang','UIWANG-SI','의왕','의왕시','Gyeonggi Uiwang'])assert.equal(search.homeSearchPath(q),'/clinics/all/uiwang');
  assert.equal(search.homeSearchPath('dentist Uiwang Goldman'),'/clinics/dentistry/uiwang?q=goldman');
  assert.equal(search.homeSearchPath('Gyeonggi Gwangju'),'/clinics/all/gyeonggi-gwangju');
  assert.equal(search.homeSearchPath('Gwangju'),'/clinics/all/gwangju');
  assert.equal(regions.extractRegion('notuiwang'),null);
  assert.equal(regions.extractRegion('Suwon Uiwang'),null);
  assert.equal(regions.extractRegion('의왕치과'),null);
  assert.equal(regions.gyeonggiRegions.length,31);
  for(const [slug,ko] of regions.gyeonggiRegions){assert.equal(regions.extractRegion(slug).slug,slug);assert(regions.regionAddresses[slug].includes(`경기도 ${ko} `));}
});

test('department links retain query, specialist constraint and station radius',()=>{
  const url=new URL(search.searchLink('dentistry','gangnam-station',{query:'Goldman & clinic',specialist:true,radius:500}),'https://example.com');
  assert.equal(url.pathname,'/clinics/dentistry/gangnam-station');
  assert.equal(url.searchParams.get('q'),'Goldman & clinic');
  assert.equal(url.searchParams.get('specialist'),'1');assert.equal(url.searchParams.get('radius'),'500');
});

test('page links retain filters and reject invalid or unbounded page inputs',()=>{
  for(const input of [undefined,'0','-1','2x','1.5',['2']])assert.equal(pagination.searchPage(input),1);
  assert.equal(pagination.searchPage('5'),5);
  assert.equal(pagination.searchPage('99999999999999999999'),pagination.MAX_PAGE);
  const url=new URL(search.searchLink('urology','gangnam-station',{query:'Goldman',specialist:true,radius:500,page:5}),'https://example.com');
  assert.equal(url.searchParams.get('page'),'5');assert.equal(url.searchParams.get('q'),'Goldman');assert.equal(url.searchParams.get('radius'),'500');assert.equal(url.searchParams.get('specialist'),'1');
  assert(!search.searchLink('dentistry','uiwang',{query:'서울'}).includes('page='));
});

test('ordinary and station pages request the requested offset plus a lookahead row',async()=>{
  const city=database();await city.api.getClinics({locationSlug:'uiwang',limit:26,offset:100});
  assert.deepEqual(city.calls.find(c=>c[0]==='range'),['range',100,125]);
  const station=database();await station.api.getClinics({locationSlug:'gangnam-station',limit:26,offset:100,radius:500,query:'Goldman',specialist:true});
  const call=station.calls.find(c=>c[0]==='rpc');assert.equal(call[1],'nearby_clinics_page');assert.equal(call[2].result_offset,100);assert.equal(call[2].result_limit,26);assert.equal(call[2].radius_m,500);assert.equal(call[2].search_query,'Goldman');assert.equal(call[2].specialist_only,true);
});

test('major station shortcuts resolve to distinct official station pages',()=>{
  const featured=load('lib/featured-stations.ts').featuredStationSlugs;
  assert.equal(featured.length,8);assert.equal(new Set(featured).size,8);
  for(const slug of featured)assert(stations.stationForSlug(slug),slug);
});

test('city terms constrain the province-qualified address before limiting results',async()=>{
  const {api,calls}=database();await api.getClinics({locationSlug:'all',query:'UIWANG Goldman'});
  assert(calls.some(c=>c[0]==='or'&&c[1].includes('경기도 의왕시 ')));
  assert(calls.some(c=>c[0]==='or'&&c[1].includes('name_en.ilike.%Goldman%')));
  assert(!calls.some(c=>c[0]==='or'&&c[1].includes('%UIWANG%')));
});
test('clinic URLs use the real domain and a fallback ID; JSON-LD cannot close its script', () => {
  assert.equal(site.SITE_URL, 'https://map.clinicinkorea.com');
  assert.equal(site.clinicPath({ id: 'goldman-gangnam' }), '/clinics/detail/goldman-gangnam');
  assert.equal(site.clinicPath({ id: 'uuid', hira_code: 'abc/def' }), '/clinics/detail/abc%2Fdef');
  const value = { name: '</script><script>alert(1)</script>' };
  assert(!site.serializeJsonLd(value).includes('<'));
  assert.deepEqual(JSON.parse(site.serializeJsonLd(value)), value);
});
function database({ error = null, locations = [], data = [] } = {}) {
  const calls = [];
  const builder = {
    select(...args) { calls.push(['select', ...args]); return this; },
    eq(...args) { calls.push(['eq', ...args]); return this; },
    contains(...args) { calls.push(['contains', ...args]); return this; },
    filter(...args) { calls.push(['filter', ...args]); return this; },
    in(...args) { calls.push(['in', ...args]); return this; },
    or(...args) { calls.push(['or', ...args]); return this; },
    order() { return this; }, limit() { return this; },
    range(...args) { calls.push(['range',...args]); return this; },
    then(resolve) { return Promise.resolve({ data, error }).then(resolve); },
  };
  const client = { rpc: async (...args) => { calls.push(['rpc', ...args]); return {data,error}; }, from(table) { return table === 'locations' ? {
    rows:locations,select(){return this;},eq(key,value){calls.push(['location-eq',key,value]);this.rows=this.rows.filter(r=>r[key]===value);return this;},
    in(key,values){calls.push(['location-in',key,values]);this.rows=this.rows.filter(r=>values.includes(r[key]));return this;},order(){return this;},
    range(start,end){calls.push(['location-range',start,end]);this.rows=this.rows.slice(start,end+1);return this;},
    async maybeSingle(){return {data:this.rows[0]||null,error};},then(resolve){return Promise.resolve({data:this.rows,error}).then(resolve);}
  } : builder; } };
  const api = load('lib/supabase.ts', { './clinic-list-select':load('lib/clinic-list-select.ts'), './search': search, './regions': regions, './stations': stations, './site':site, './goldman':load('lib/goldman.ts',{'./site':site}), '@supabase/supabase-js': { createClient: () => client } });
  return { calls, api };
}
test('keyword and specialist constraints reach the database before the result limit', async () => {
  const { calls, api } = database();
  await api.getClinics({ query: 'Goldman 강남', specialist: true, categorySlug: 'urology' });
  assert(calls.some(call => call[0] === 'contains' && call[1] === 'departments' && JSON.parse(call[2])[0].slug === 'urology'));
  assert(calls.some(call => call[0] === 'contains' && call[1] === 'specialist_slugs' && call[2][0] === 'urology'));
  assert.equal(calls.filter(call => call[0] === 'or').length, 2);
  assert(calls.some(call => call[0] === 'or' && call[1].includes('name_en.ilike.%Goldman%')));
});
test('exact scoped location search includes descendants but not prefix neighbours', async () => {
  const { calls, api } = database({ locations: [{id: 1, slug: 'seoul--gangnam-gu'}, {id: 2, slug: 'seoul--gangnam-gu--yeoksamdong', parent_id: 1}, {id: 3, slug:'seoul--gangnam-gu-other'}] });
  await api.getClinics({ locationSlug: 'seoul--gangnam-gu' });
  assert.deepEqual(calls.find(call => call[0] === 'in'), ['in', 'location_id', [1, 2]]);
  const unknown = database();
  assert.deepEqual(await unknown.api.getClinics({ locationSlug: 'unknown' }),[]);
  assert(unknown.calls.some(call => call[0]==='location-eq' && call[1] === 'slug' && call[2] === 'unknown'));
  assert(!unknown.calls.some(call=>call[0]==='select'));
});

test('location lookup handles roots beyond the API cap, paginates children and fails closed',async()=>{
 const locations=[...Array.from({length:1100},(_,i)=>({id:i+1,slug:`unrelated-${i}`})),{id:2000,slug:'target'},...Array.from({length:1100},(_,i)=>({id:2001+i,slug:`child-${i}`,parent_id:2000}))];
 const {calls,api}=database({locations});await api.getClinics({locationSlug:'target',categorySlug:'dentistry',specialist:true,registered:true,limit:26,offset:25});
 const scope=calls.find(c=>c[0]==='in'&&c[1]==='location_id')[2];assert.equal(scope.length,1101);assert.equal(scope[0],2000);assert(!scope.includes(1));
 assert(calls.some(c=>c[0]==='location-range'&&c[1]===1000));assert.deepEqual(calls.find(c=>c[0]==='range'),['range',25,50]);
 assert(!calls.some(c=>c[1]==='locations.slug'));
 const failure=database({locations,error:{message:'offline'}});await assert.rejects(failure.api.getClinics({locationSlug:'target'}),/Unable to load clinic locations/);
 assert(!failure.calls.some(c=>c[0]==='select'));
});

test('Gangnam uses full province/district address constraints instead of merged dong IDs', async () => {
  const { calls, api } = database();
  await api.getClinics({locationSlug:'gangnam'});
  assert(!calls.some(c=>c[0]==='in'));
  const filter = calls.find(c=>c[0]==='or')[1];
  assert(filter.includes('서울특별시 강남구 '));
  assert(filter.includes('서울특별시 서초구 '));
  assert(!filter.includes('신사동'));
});

test('station searches use official line coordinates and database radius sorting', async () => {
  const { calls, api } = database();
  await api.getClinics({locationSlug:'seoul-station',radius:500,categorySlug:'dentistry'});
  const call=calls.find(c=>c[0]==='rpc');
  assert.equal(call[1],'nearby_clinics');
  assert.equal(call[2].radius_m,500);
  assert.equal(call[2].category_slug,'dentistry');
  assert.deepEqual(call[2].station_ids, stations.stationForSlug('seoul-station').stations.map(s=>s.id));
  assert.equal(search.homeSearchPath('Gangnam Station dentist'),'/clinics/dentistry/gangnam-station');
  assert.equal(stations.searchRadius('99999'),1000);
});

test('national stations retain provenance, distinct cities, stable URLs and valid coordinates', () => {
  assert(stations.stationPages.length>1000);
  assert.equal(new Set(stations.stationPages.map(s=>s.slug)).size,stations.stationPages.length);
  for(const ko of ['서면역','반월당역','문화전당역','대전역']) assert(stations.stationPages.some(s=>s.name_ko===ko));
  const jungang=stations.stationPages.filter(s=>s.name_ko==='중앙역');
  assert(jungang.some(s=>s.city.includes('Busan')));
  assert(jungang.some(s=>s.city.includes('Seoul')));
  const busan=stations.stationPages.find(s=>s.name_ko==='서면역');
  assert.equal(busan.stations.length,2);
  assert(busan.stations.every(s=>s.latitude>35.15&&s.latitude<35.17&&s.longitude>129.05&&s.longitude<129.07));
  for(const p of stations.stationPages) for(const s of p.stations){
    assert(s.latitude>=33&&s.latitude<=39&&s.longitude>=124&&s.longitude<=132);
    assert(/^https:\/\/(data.kric.go.kr|www.data.go.kr)\//.test(s.source_url));
    assert(/^20\d\d-\d\d-\d\d$/.test(s.source_date));
    assert(!['32','1294'].includes(s.source_id));
  }
  assert.equal(search.homeSearchPath('dentist Busan'),'/clinics/dentistry/busan');
  assert.equal(search.homeSearchPath('Jeju'),'/clinics/all/jeju');
});
test('database failures are not silently presented as zero search results', async () => {
  const { api } = database({ error: { message: 'offline' } });
  await assert.rejects(api.getClinics(), /Unable to load clinics/);
});

test('registration requires a positive dated registry record and never implies language services', () => {
  assert.equal(evidence.registeredEvidence({foreign_patient_registration:{status:'candidate',source_date:'2026-07-21'}}),null);
  assert.equal(evidence.registeredEvidence({foreign_patient_registration:{status:'listed'}}),null);
  const record={status:'listed',source_date:'2026-07-21'};
  assert.equal(evidence.registeredEvidence({foreign_patient_registration:record}),record);
  assert.equal(record.english_possible,undefined);
});

test('legacy priority classifications are not displayed as verified clinic focus', () => {
  const clinic={categories:{name_en:'Urology'},is_premium:false};
  assert.equal(evidence.clinicFocus(clinic),'Medical Clinic');
  assert.equal(evidence.clinicFocus({...clinic,department_source:{provider:'HIRA'},categories:{name_en:'Pediatrics'}}),'Pediatrics');
});

test('specialist counts stay attached to the department that reported them', () => {
  const list=evidence.groupedDepartments({departments:[
    {code:'11',slug:'pediatrics',name_en:'Pediatrics',specialist_count:1},
    {code:'15',slug:'urology',name_en:'Urology',specialist_count:0}
  ]});
  assert.equal(list.find(d=>d.slug==='urology').specialists,0);
  assert.equal(list.find(d=>d.slug==='pediatrics').specialists,1);
});

const suggestions=load('lib/home-suggestions.ts',{'./stations':stations,'./national-regions':national,'./search':search});

test('regional department phrases offer area results without generic name constraints',()=>{
 for(const input of ['gangnam urology clinic','urology clinics in Gangnam','Gangnam hospital urologist'])assert.equal(search.homeSearchPath(input),'/clinics/urology/gangnam');
 assert.equal(search.homeSearchPath('Busan dental clinic'),'/clinics/dentistry/busan');
 assert.equal(search.homeSearchPath('Gangnam Station urology clinic'),'/clinics/urology/gangnam-station');
 assert.equal(search.homeSearchPath('Goldman urology clinic Gangnam'),'/clinics/urology/gangnam?q=goldman%20clinic');
 assert.equal(search.homeSearchPath('clinic'),'/clinics/all/all?q=clinic');
 assert(suggestions.homeSuggestions('gangnam urology clinic').regions.some(r=>r.href==='/clinics/urology/gangnam'));
 assert(suggestions.homeSuggestions('gangnam urology clinic').stations.some(r=>r.href==='/clinics/urology/gangnam-station'));
 assert(!suggestions.homeSuggestions('Gangnam Station urology clinic').regions.some(r=>r.href==='/clinics/urology/gangnam'));
});
test('home station suggestions distinguish nearby clinics and preserve department and extra terms',()=>{
 assert(suggestions.homeSuggestions('skin doctor in busan').regions.some(r=>r.href==='/clinics/dermatology/busan'));
 assert(suggestions.homeSuggestions('eye doctor near Gangnam Station').stations.some(r=>r.href==='/clinics/ophthalmology/gangnam-station'));
 assert.deepEqual(suggestions.homeSuggestions('Seoul urology near me'),{stations:[],regions:[]});
 assert.equal(suggestions.homeSuggestions('Hongdae dentist').stations[0].href,'/clinics/dentistry/station-86b835f49957a6');
 assert.equal(suggestions.homeSuggestions('홍대').stations[0].label,'Hongik Univ. Station');
 const result=suggestions.homeSuggestions('Hongdae dentist gentle').stations[0];
 assert.equal(new URL(result.href,'https://example.com').searchParams.get('q'),'gentle');
 assert.equal(suggestions.homeSuggestions('x').stations.length,0);
 assert.equal(suggestions.homeSuggestions('unrelatedstationname').stations.length,0);
 assert.ok(suggestions.homeSuggestions('Seoul').stations.length>0);
 assert.ok(suggestions.homeSuggestions('Seoul').regions.some(r=>r.href==='/clinics/all/seoul'));
 assert.ok(suggestions.homeSuggestions('Jung-gu').regions.length>1);
});
test('expanded medical department searches keep location and non-department words',()=>{
 assert.equal(search.homeSearchPath('ENT Busan'),'/clinics/ent/busan');
 assert.equal(search.homeSearchPath('pediatrician seoul'),'/clinics/pediatrics/seoul');
 assert.equal(search.homeSearchPath('orthopedics Busan evening'),'/clinics/orthopedics/busan?q=evening');
 assert.equal(search.homeSearchPath('ob-gyn'),'/clinics/ob-gyn/all');
 assert.equal(search.homeSearchPath('eye clinic'),'/clinics/ophthalmology/all');
});

const areaNavigation=load('lib/area-navigation.ts',{'./department-labels.json':JSON.parse(fs.readFileSync(path.join(__dirname,'../lib/department-labels.json'),'utf8')),'./search':search});
test('area browsing keeps department, keywords and specialist constraint across province and district choices',()=>{
 const context=areaNavigation.areaContext({department:'dentistry',q:'gentle clinic',specialist:'1',page:'3',radius:'500'});
 assert.equal(areaNavigation.areaBrowseLink('seoul',context),'/areas/seoul?department=dentistry&q=gentle+clinic&specialist=1');
 assert.equal(areaNavigation.areaClinicLink('area-seoul-mapo-gu',context),'/clinics/dentistry/area-seoul-mapo-gu?q=gentle+clinic&specialist=1');
 assert.equal(areaNavigation.areaBrowseLink(undefined,{...context,department:'all'}),'/areas?q=gentle+clinic&specialist=1');
});
test('area context rejects unsupported department values and repeated query parameters',()=>{
 assert.deepEqual(areaNavigation.areaContext({department:'../../bad',q:['a','b'],specialist:['1','0']}),{department:'all',query:'',specialist:false});
 assert.equal(areaNavigation.areaContext({q:'x'.repeat(300)}).query.length,200);
 assert.equal(areaNavigation.areaContext({department:'ent'}).department,'ent');
});

test('registry and specialist constraints intersect before pagination in city and station searches',async()=>{
 const city=database();await city.api.getClinics({locationSlug:'seoul',categorySlug:'dentistry',specialist:true,registered:true,offset:25,limit:26});
 assert(city.calls.some(c=>c[0]==='contains'&&c[1]==='specialist_slugs'));
 assert(city.calls.some(c=>c[0]==='contains'&&c[1]==='foreign_patient_registration'&&c[2].status==='listed'));
 assert(city.calls.findIndex(c=>c[0]==='filter')<city.calls.findIndex(c=>c[0]==='range'));
 const station=database();await station.api.getClinics({locationSlug:'seoul-station',categorySlug:'ent',registered:true,specialist:true,offset:25,limit:26,radius:500});
 const rpc=station.calls.find(c=>c[0]==='rpc');assert.equal(rpc[1],'nearby_registered_clinics_page');assert.equal(rpc[2].specialist_only,true);assert.equal(rpc[2].result_offset,25);assert.equal(rpc[2].radius_m,500);
});

test('registration filter survives navigation and can be removed independently',()=>{
 const input={department:'ent',location:'seoul-station',query:'clinic',specialist:true,registered:true,radius:500,page:2,departmentLabel:'ENT',locationLabel:'Seoul Station'};
 const filters=active.activeFilters(input).filters;
 const removed=new URL(filters.find(f=>f.action==='Remove registration filter').href,'https://example.com');assert(!removed.searchParams.has('registered'));assert.equal(removed.searchParams.get('specialist'),'1');
 const specialist=new URL(filters.find(f=>f.action==='Remove specialist filter').href,'https://example.com');assert.equal(specialist.searchParams.get('registered'),'1');
 const context=areaNavigation.areaContext({department:'ent',registered:'1',specialist:'1',q:'clinic'});assert(areaNavigation.areaClinicLink('busan',context).includes('registered=1'));assert(areaNavigation.areaBrowseLink('busan',context).includes('registered=1'));
 for(const link of recovery.searchRecovery(input).filter(l=>l.label!=='Remove registration filter'&&l.href.startsWith('/clinics/')))assert.equal(new URL(link.href,'https://example.com').searchParams.get('registered'),'1');
});

test('English urology regions share explicit area/station intent and retain keyword qualifiers',()=>{
 const cases=[['seoul urology clinic','seoul'],['gangnam urology clinic','gangnam'],['incheon urology clinic','incheon'],['jamsil urology clinic','jamsil-station'],['jamsil-dong urology clinic','jamsil'],['seocho urology clinic','area-seoul-seocho-gu'],['dongtan urology clinic','dongtan'],['seoul station urology clinic','seoul-station']];
 for(const [q,slug] of cases){assert.equal(search.homeSearchPath(q),'/clinics/urology/'+slug);assert.equal(search.urologySearchChoice(q).href,search.homeSearchPath(q));}
 assert.equal(search.homeSearchPath('guwol-dong urology clinic'),'/clinics/urology/guwol-dong');
 assert.equal(search.homeSearchPath('Goldman urology Jamsil'),'/clinics/urology/jamsil-station?q=goldman');
 assert.equal(search.homeSearchPath('Jamsil-dong dentistry'),'/clinics/dentistry/jamsil');
 assert.equal(search.urologySearchChoice('urology near me'),undefined);
 assert.equal(search.homeSearchPath('urology near me'),'/nearby?department=urology');
});

test('Guwol fixed comparison preserves qualifiers and applies exact address scope before pagination',async()=>{
 for(const q of ['guwol urology clinic','guwol-dong urology clinic','urologist in Guwol dong Incheon'])assert.equal(search.homeSearchPath(q),'/clinics/urology/guwol-dong');
 assert.equal(search.homeSearchPath('Goldman urology Guwol-dong'),'/clinics/urology/guwol-dong?q=goldman');
 assert.equal(search.urologySearchChoice('guwol-dong urology clinic').href,'/clinics/urology/guwol-dong');
 const {calls,api}=database();await api.getClinics({locationSlug:'guwol-dong',categorySlug:'urology',limit:26,offset:25});
 const scope=calls.find(c=>c[0]==='or')[1];
 assert(scope.includes('인천광역시 남동구 % (구월동,'));assert(scope.includes('인천 남동구 % (구월동)'));
 assert(!calls.some(c=>c[0]==='location-eq'||c[0]==='in'));
 assert(calls.findIndex(c=>c[0]==='or')<calls.findIndex(c=>c[0]==='range'));
 const matches=address=>regions.regionAddresses['guwol-dong'].some(p=>new RegExp('^'+(p+'%').replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/%/g,'.*')+'$').test(address));
 assert(matches('인천광역시 남동구 예술로 138, (구월동, 이토타워)'));
 assert(matches('인천 남동구 예술로 138, (구월동)'));
 assert(!matches('인천광역시 남동구 구월동의원로 1, (만수동)'));
 assert(!matches('서울특별시 남동구 예술로 138, (구월동)'));
 assert(!matches('인천광역시 남동구 예술로 138, (구월동산)'));
});
