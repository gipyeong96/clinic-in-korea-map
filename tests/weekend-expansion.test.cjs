const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
function load(name){if(name.endsWith('.json'))return JSON.parse(fs.readFileSync('lib/'+name.slice(2),'utf8'));const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync('lib/'+name.slice(2)+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(m,m.exports,load);return m.exports;}
const records=load('./weekend-hours-pilot.json'),{weekendHours}=load('./weekend-hours'),{filterWeekendClinics}=load('./weekend-search'),{weekendCoverage}=load('./weekend-coverage');
test('expanded records stay within Incheon and Dongtan district, with valid Saturday and Sunday states',()=>{
 const added=Object.entries(records).filter(([,r])=>r.checkedAt==='2026-10-29');assert.equal(added.length,1467);
 for(const [,r] of added){assert(r.address.startsWith('인천광역시 ')||r.address.startsWith('경기도 화성시 동탄구 '));for(const d of ['saturday','sunday'])assert(['reported_schedule','not_reported'].includes(r[d].status));}
 assert.equal(weekendCoverage('incheon','Incheon'),'pilot');assert.equal(weekendCoverage('dongtan','Dongtan'),'pilot');assert.equal(weekendCoverage('area-incheon-namdong-gu','Namdong-gu'),'pilot');assert.equal(weekendCoverage('hwaseong','Hwaseong'),'limited');assert.equal(weekendCoverage('busan','Busan'),'outside');
});
test('Incheon official phone resolves only the verified identity and is returned for calling',()=>{
 const [id,r]=Object.entries(records).find(([,r])=>r.sourceHpid==='A1400705');const raw=r.identities[0];assert.equal(raw.telephone,'221-1911');
 assert.equal(weekendHours(id,raw.name,raw.address,raw.telephone).telephone,'032-221-1911');
 assert.equal(weekendHours(id,'Other clinic',raw.address,raw.telephone),null);assert.equal(weekendHours(id,raw.name,'Other address',raw.telephone),null);assert.equal(weekendHours(id,raw.name,raw.address,'032-000-0000'),null);
 const row={id:'incheon',hira_code:id,name_ko:raw.name,address_ko:raw.address,telephone:raw.telephone,departments:[{slug:'urology'}]};
 const results=filterWeekendClinics([row],{weekend:'saturday',categorySlug:'urology'});assert.equal(results.length,1);assert.equal(results[0].telephone,'032-221-1911');assert.match(results[0].weekend_label,/09:00–16:00/);assert.equal(filterWeekendClinics([row],{weekend:'sunday'}).length,0);
 for(const identity of r.identities)assert(weekendHours(id,identity.name,identity.address,identity.telephone));
});
test('Dongtan uses its official Saturday 15:00 closing time for both public and branch profile identities',()=>{
 const [id,r]=Object.entries(records).find(([,r])=>r.scheduleSource?.includes('tab=7'));assert.equal(r.saturday.end,'15:00');assert.equal(r.scheduleSourceLabel,'Official clinic website');assert(weekendHours(id,r.name,r.address,r.telephone));for(const identity of r.identities)assert.equal(weekendHours(id,identity.name,identity.address,identity.telephone).saturday.end,'15:00');
});
