const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
function load(name){if(name.endsWith('.json'))return JSON.parse(fs.readFileSync('lib/'+name.slice(2),'utf8'));const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync('lib/'+name.replace('./','')+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(m,m.exports,load);return m.exports;}
const {filterWeekendClinics}=load('./weekend-search'),search=load('./search'),area=load('./area-navigation'),active=load('./active-filters'),nav=load('./detail-navigation'),nearby=load('./nearby');
const records=load('./weekend-hours-pilot.json');
const rows=Object.entries(records).filter(([id,r])=>r.saturday.status==='reported_schedule').slice(0,3).map(([id,r],i)=>({id:String(i),hira_code:id,name_ko:r.name,address_ko:r.address,telephone:r.telephone,departments:[{slug:'urology'}],specialist_slugs:['urology'],latitude:37.5+i*.001,longitude:127,foreign_patient_registration:{status:'listed',source_date:'2026-10-26'}}));
test('weekend intersection applies identity, specialty, registry and distance before pagination',()=>{
 const r=[{...rows[0],telephone:'changed'},...rows];
 assert.deepEqual(filterWeekendClinics(r,{weekend:'saturday',categorySlug:'urology',specialist:true,registered:true,offset:1,limit:1}).map(c=>c.id),['1']);
 assert.equal(filterWeekendClinics(rows,{weekend:'saturday',categorySlug:'dentistry'}).length,0);
 assert.equal(filterWeekendClinics(rows,{weekend:'saturday',origins:[{latitude:35,longitude:129}],radius:2000}).length,0);
 const sorted=filterWeekendClinics([...rows].reverse(),{weekend:'saturday',origins:[{latitude:37.5,longitude:127}],radius:1000,limit:2});assert.deepEqual(sorted.map(c=>c.id),['0','1']);
 assert.equal(filterWeekendClinics(rows,{weekend:'saturday',query:'%%%'}).length,0);
});
test('weekend survives station/area/nearby/detail links and independent filter removal',()=>{
 const options={weekend:'sunday',specialist:true,registered:true,query:'clinic',radius:2000};
 for(const url of [search.searchLink('urology','jamsil-station',options),search.nearbySearchLink('urology',options),area.areaBrowseLink(undefined,{...options,department:'urology'})])assert.equal(new URL(url,'https://example.com').searchParams.get('weekend'),'sunday');
 const ctx=area.areaContext({department:'urology',weekend:'sunday',specialist:'1'});assert.equal(ctx.weekend,'sunday');assert.match(area.areaClinicLink('gangnam',ctx),/weekend=sunday/);
 const path=search.searchLink('urology','jamsil-station',options);assert.equal(nav.searchReturnPath(path),path);
 const filters=active.activeFilters({...options,department:'urology',location:'jamsil',departmentLabel:'Urology',locationLabel:'Jamsil'}).filters;
 assert(!filters.find(f=>f.action==='Remove weekend filter').href.includes('weekend='));assert(filters.find(f=>f.action==='Remove specialist filter').href.includes('weekend=sunday'));
 assert.equal(nearby.nearbyOptions({weekend:'sunday'}).weekend,'sunday');assert.equal(nearby.nearbyOptions({weekend:['sunday']}).weekend,undefined);
});
