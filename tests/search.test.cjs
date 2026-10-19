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
const search = load('lib/search.ts');
const site = load('lib/site.ts');
const regions = load('lib/regions.ts');
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
  assert(calls.some(call => call[0] === 'eq' && call[1] === 'categories.slug' && call[2] === 'urology'));
  assert(calls.some(call => call[0] === 'eq' && call[1] === 'has_specialist' && call[2] === true));
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
  assert.equal(call[2].station_ids.length,2);
  assert.equal(search.homeSearchPath('Gangnam Station dentist'),'/clinics/dentistry/gangnam-station');
  assert.equal(stations.searchRadius('99999'),1000);
});
test('database failures are not silently presented as zero search results', async () => {
  const { api } = database({ error: { message: 'offline' } });
  await assert.rejects(api.getClinics(), /Unable to load clinics/);
});
