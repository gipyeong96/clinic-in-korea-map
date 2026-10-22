const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
function load(file,imports={}){const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(m,m.exports,n=>imports[n]||require(n));return m.exports;}
const guides=load('lib/care-guides.ts'),nearby=load('lib/nearby.ts',{'./department-labels.json':require('../lib/department-labels.json')});
const slugs=context=>guides.contextualCareGuides(context).map(g=>g.slug);
test('guide context prioritizes relevant evidence and never suggests Gangnam for another city or department',()=>{
 assert.equal(slugs({specialist:true})[0],'understand-clinic-information');assert.equal(slugs({registered:true})[0],'understand-clinic-information');
 assert.deepEqual(slugs({department:'urology',location:'gangnam',stage:'profile'}),['before-visiting-a-clinic-in-korea','choose-urology-clinic-gangnam']);
 for(const context of [{department:'dentistry',location:'gangnam'},{department:'urology',location:'busan'},{department:'urology',location:'seoul'},{department:'urology',location:'gangnam',stage:'nearby'},{department:'all',location:'gangnam'}])assert(!slugs(context).includes('choose-urology-clinic-gangnam'));
 for(const context of [{},{registered:true},{specialist:true},{stage:'profile'},{department:'urology',location:'gangnam'}]){const result=slugs(context);assert.equal(result.length,2);assert.equal(new Set(result).size,2);assert(result.every(s=>guides.careGuides.some(g=>g.slug===s)));}
});
test('nearby review accurately describes chosen radius, department, keyword and both evidence filters',()=>{
 const summary=nearby.nearbySummary({department:'urology',radius:500,specialist:true,registered:true,query:'Goldman'});
 for(const part of ['Urology','Within 500 m','Specialists reported','International-patient registration listed','Keyword: Goldman'])assert(summary.includes(part));
 assert.equal(nearby.nearbySummary({department:'all',radius:2000,specialist:false,registered:false,query:''}),'All departments · Within 2 km');
 assert.deepEqual(nearby.nearbyDepartments.map(d=>d.slug),['urology','dentistry','dermatology']);
});
