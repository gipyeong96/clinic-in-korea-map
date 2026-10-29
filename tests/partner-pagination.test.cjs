const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
function load(name){if(name.endsWith('.json'))return JSON.parse(fs.readFileSync('lib/'+name.slice(2),'utf8'));const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync('lib/'+name.slice(2)+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(m,m.exports,load);return m.exports;}
const site=load('./site'),{partnerFirstPage}=load('./partner-query'),{filterWeekendClinics}=load('./weekend-search'),records=load('./weekend-hours-pilot.json');
const partner=site.unifiedClinicRecords.find(r=>r.id==='goldman-incheon');
function fixture(rows,errorPartition){return ()=>{let selection=rows.slice().sort((a,b)=>Number(!!b.is_premium)-Number(!!a.is_premium)||String(a.id).localeCompare(String(b.id))),partition='ordinary';return {
 or(){partition='partners';selection=selection.filter(site.goldmanProfileId);return this;},
 order(){return this;},limit(n){selection=selection.slice(0,n);return this;},
 not(key,op,value){const excluded=value.slice(1,-1).split(',');selection=selection.filter(r=>!excluded.includes(r.id));return this;},
 range(start,end){selection=selection.slice(start,end+1);return this;},
 then(resolve){return Promise.resolve(partition===errorPartition?{data:null,error:{message:'offline'}}:{data:selection,error:null}).then(resolve);}
 };};}
test('a partner beyond page one moves ahead of pagination without duplicating or skipping other results',async()=>{
 const others=Array.from({length:62},(_,i)=>({id:'00000000-0000-0000-0000-'+String(i).padStart(12,'0')}));
 const managed={id:partner.aliases[0],name_en:'Managed'},publicRow={id:partner.aliases[2],hira_code:partner.hira,department_source:{provider:'HIRA'}};
 const build=fixture([...others,managed,publicRow]);const pages=[];for(let offset=0;offset<75;offset+=25)pages.push(await partnerFirstPage(build,{offset,limit:25}));
 assert.equal(site.goldmanProfileId(pages[0][0]),'goldman-incheon');assert.equal(pages.flat().filter(site.goldmanProfileId).length,1);assert.deepEqual(pages.flat().filter(r=>!site.goldmanProfileId(r)),others);
 const lookahead=await partnerFirstPage(build,{offset:0,limit:26});assert.equal(lookahead.length,26);assert.deepEqual(lookahead.slice(0,25),pages[0]);assert.deepEqual(lookahead[25],pages[1][0]);
});
test('filtered-out partners are never injected and either partition failing remains an error',async()=>{
 const rows=[{id:'ordinary'}];assert.deepEqual(await partnerFirstPage(fixture(rows),{limit:25}),rows);
 for(const partition of ['partners','ordinary'])await assert.rejects(partnerFirstPage(fixture(rows,partition),{}),/Unable to load clinics/);
});
test('bounded windows keep every ordinary row across partner positions, premium tiers and deep pages',async()=>{
 const second=site.unifiedClinicRecords[0];
 for(const premium of [false,true]){
  const rows=Array.from({length:87},(_,i)=>({id:i.toString(16).padStart(8,'0')+'-0000-0000-0000-000000000000',is_premium:i%3===0}));
  rows.push({id:partner.aliases[0],is_premium:premium},{id:partner.aliases[2],hira_code:partner.hira,is_premium:false,department_source:{provider:'HIRA'}},{id:second.aliases[0],is_premium:false});
  const base=[...rows].sort((a,b)=>Number(!!b.is_premium)-Number(!!a.is_premium)||a.id.localeCompare(b.id));const expected=site.prioritizeGoldman(site.uniqueClinicProfiles(base));
  const build=fixture(rows);for(const offset of [0,1,2,24,25,26,50,75,87,100])for(const limit of [1,25,26])assert.deepEqual(await partnerFirstPage(build,{offset,limit}),expected.slice(offset,offset+limit),`offset ${offset}, limit ${limit}, premium ${premium}`);
 }
});
test('weekend partner priority happens after eligibility and before page slicing',()=>{
 const entry=records[partner.hira],raw=entry.identities[0],goldman={id:partner.aliases[2],hira_code:partner.hira,name_ko:raw.name,address_ko:raw.address,telephone:raw.telephone,departments:[{slug:'urology'}]};
 const others=Object.entries(records).filter(([id,r])=>id!==partner.hira&&r.saturday.status==='reported_schedule').slice(0,35).map(([id,r],i)=>({id:'00000000-0000-0000-0000-'+String(i).padStart(12,'0'),hira_code:id,name_ko:r.name,address_ko:r.address,telephone:r.telephone,departments:[{slug:'urology'}]}));
 assert.equal(filterWeekendClinics([...others,goldman],{weekend:'saturday',limit:25})[0].id,goldman.id);
 assert(!filterWeekendClinics([...others,goldman],{weekend:'saturday',offset:25,limit:25}).some(site.goldmanProfileId));
 assert.equal(filterWeekendClinics([goldman],{weekend:'sunday'}).length,0);assert.equal(filterWeekendClinics([goldman],{weekend:'saturday',registered:true}).length,0);assert.equal(filterWeekendClinics([goldman],{weekend:'saturday',categorySlug:'dentistry'}).length,0);
});
