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
const regions = load('lib/regions.ts');
const search = load('lib/search.ts',{'./regions':regions});
const site = load('lib/site.ts');
const evidence = load('lib/clinic-evidence.ts');
const stations = load('lib/stations.ts', { './stations.json': JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/stations.json'), 'utf8')) });
test('home search recognizes department/location but retains all other search terms', () => {
  assert.equal(search.homeSearchPath('Dentist Gangnam'), '/clinics/dentistry/gangnam');
  assert.equal(search.homeSearchPath('Goldman urology Seoul Station'), '/clinics/urology/seoul-station?q=goldman');
  assert.equal(search.homeSearchPath('dentist Seoul'), '/clinics/dentistry/seoul');
  assert.equal(search.homeSearchPath('zzzz-no-such-clinic'), '/clinics/all/all?q=zzzz-no-such-clinic');
  assert.equal(search.homeSearchPath(''), '/clinics/all/all');
  assert.equal(search.homeSearchPath('Gangnam unknownword'), '/clinics/all/gangnam?q=unknownword');
});
test('text search does not accept PostgREST syntax or wildcard-only queries', () => {
  assert.deepEqual(search.searchTerms('%%_*,()."\\'), []);
  assert.deepEqual(search.searchTerms('강남 Goldman'), ['강남', 'Goldman']);
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
    in(...args) { calls.push(['in', ...args]); return this; },
    or(...args) { calls.push(['or', ...args]); return this; },
    order() { return this; }, limit() { return this; },
    then(resolve) { return Promise.resolve({ data, error }).then(resolve); },
  };
  const client = { rpc: async (...args) => { calls.push(['rpc', ...args]); return {data,error}; }, from(table) { return table === 'locations' ? { select: async () => ({ data: locations }) } : builder; } };
  const api = load('lib/supabase.ts', { './search': search, './regions': regions, './stations': stations, '@supabase/supabase-js': { createClient: () => client } });
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
  await unknown.api.getClinics({ locationSlug: 'unknown' });
  assert(unknown.calls.some(call => call[1] === 'locations.slug' && call[2] === 'unknown'));
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
