const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const modulePilot={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync('lib/profile-search-metadata.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(p=>p==='./clinic-contact'?{clinicName:c=>c.name_en}:p==='./clinic-evidence'?{clinicFocus:c=>c.categories.name_en}:{clinicRegion:c=>c.address_ko?{label:'Bundang-gu, Seongnam-si, Gyeonggi'}:null},modulePilot,modulePilot.exports);
const metadata=modulePilot.exports.profileSearchMetadata,id='JDU4MTI3MSM1MSMkMiMkMCMkMDAkNDgxOTYxIzMxIyQxIyQ3IyQ2MiQ0NjE0ODEjODEjJDEjJDYjJDgz';
test('observed profile title uses source-backed focus and region without expanding to partners or missing evidence',()=>{
 const c={hira_code:id,department_source:{provider:'HIRA'},name_en:'Hansarang Clinic',categories:{name_en:'Orthopedics'},address_ko:'source address'};
 assert(metadata(c).title.includes('Orthopedics in Bundang-gu'));assert.equal(metadata({...c,hira_code:'goldman-jamsil'}),undefined);assert.equal(metadata({...c,department_source:null}),undefined);assert.equal(metadata({...c,address_ko:''}),undefined);
});
