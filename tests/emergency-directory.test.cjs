const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync('lib/emergency-directory.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2019,esModuleInterop:true}}).outputText)(m,m.exports,p=>JSON.parse(fs.readFileSync('lib/'+p.slice(2),'utf8')));
const {emergencyRecords:records,emergencyRegions:regions,emergencySearch:search,emergencyPhone:phone,emergencyPath:path}=m.exports;
test('national NMC import keeps exact unique identities, source classifications and coordinates',()=>{
 assert.equal(records.length,532);assert.equal(new Set(records.map(r=>r.id)).size,532);assert.equal(regions.filter(r=>r.count>0).length,17);
 const counts={};for(const r of records){counts[r.classCode]=(counts[r.classCode]||0)+1;assert(r.nameKo&&r.addressKo&&r.emergencyPhone);assert(r.latitude>=32&&r.latitude<=40&&r.longitude>=123&&r.longitude<=133);assert(regions.some(p=>p.slug===r.region));}
 assert.deepEqual(counts,{G009:116,G007:233,G006:139,G001:44});assert.equal(regions.reduce((sum,r)=>sum+r.count,0),532);
});
test('regions, districts and institution types never leak records across scope; pagination retains all eligible rows',()=>{
 assert.equal(search({}).records.length,0);assert.equal(search({region:'seoul'}).total,75);assert.equal(search({region:'busan'}).total,38);assert.equal(search({region:'jeju'}).total,6);
 const all=[];for(let p=1;p<=4;p++)all.push(...search({region:'seoul',page:String(p)}).records);assert.equal(all.length,75);assert.equal(new Set(all.map(r=>r.id)).size,75);assert(all.every(r=>r.region==='seoul'));
 const district=search({region:'seoul'}).districts[0];assert(search({region:'seoul',district}).records.every(r=>r.district===district));
 const filtered=search({region:'seoul',type:'G009'});assert(filtered.records.every(r=>r.classCode==='G009'));
 for(const q of [{region:'unknown'},{region:'seoul',district:'부산광역시'},{region:'seoul',type:'anything'}]){assert.equal(search(q).valid,false);assert.equal(search(q).records.length,0);}
 assert.equal(search({region:'seoul',page:'99999'}).page,4);assert.equal(search({region:'seoul',page:'-1'}).page,1);
});
test('contact links and coarse measurement reject private input and unsafe phone formats',()=>{
 assert.equal(phone('02-1234-5678'),'tel:+82212345678');assert.equal(phone('031-123-4567'),'tel:+82311234567');for(const p of ['javascript:alert(1)','123','+82-2-1234-5678','02-1234-5678 ext99'])assert.equal(phone(p),null);
 assert.equal(path({region:'seoul',district:'중구',type:'G006',page:'2'}),'/emergency?region=seoul&district=%EC%A4%91%EA%B5%AC&type=G006&page=2');
 const module={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync('lib/measurement.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module,module.exports);
 const p=module.exports.measurementPayload('page_view','/emergency?region=private-region&gps=private-location');assert(!JSON.stringify(p).includes('private-'));assert.equal(p.page_location,'https://map.clinicinkorea.com/measure/other');
});
