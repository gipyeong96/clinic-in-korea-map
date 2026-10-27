const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
function load(name){const m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync('lib/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);return m.exports;}
const {matchesClassification:match,matchesSpecialist:specialist,applyClassification}=load('clinic-classification');
const {confirmedEmptyResult}=load('search-indexing');
const clinic={categories:{slug:'long-term-care'},departments:[{slug:'internal-medicine'}],specialist_slugs:['internal-medicine'],has_specialist:true,department_source:{provider:'HIRA'}};
test('institution focus and reported specialty are distinct and intersect correctly',()=>{
 assert(match(clinic,'long-term-care'));assert(match(clinic,'internal-medicine'));assert(!match(clinic,'urology'));assert(!match(clinic,'medical-clinic'));
 assert(specialist(clinic,'long-term-care'));assert(specialist(clinic,'internal-medicine'));assert(!specialist(clinic,'urology'));assert(!specialist({...clinic,department_source:null},'long-term-care'));
});
test('query uses category relation only for institution focus and retains specialist evidence',()=>{
 const calls=[];const q={eq:(...v)=>{calls.push(['eq',...v]);return q},contains:(...v)=>{calls.push(['contains',...v]);return q},not:(...v)=>{calls.push(['not',...v]);return q}};
 applyClassification(q,'long-term-care',true);assert(calls.some(c=>c[1]==='categories.slug'));assert(!calls.some(c=>c[1]==='departments'));assert(calls.some(c=>c[1]==='department_source'));
 calls.length=0;applyClassification(q,'urology',true);assert(calls.some(c=>c[1]==='departments'));assert(calls.some(c=>c[1]==='specialist_slugs'));assert(!calls.some(c=>c[1]==='categories.slug'));
});
test('only a successful zero result triggers new index exclusion',()=>{
 assert.equal(confirmedEmptyResult({clinics:[],failed:false}),true);
 assert.equal(confirmedEmptyResult({clinics:[],failed:true}),false);
 assert.equal(confirmedEmptyResult({clinics:[clinic],failed:false}),false);
 assert.equal(confirmedEmptyResult(null),false);
});
