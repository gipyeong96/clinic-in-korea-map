const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
function load(path){const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2019,esModuleInterop:true}}).outputText)(m,m.exports,p=>p.endsWith('.json')?JSON.parse(fs.readFileSync(`lib/${p.slice(2)}`,'utf8').replace(/^\uFEFF/,'')):load(`lib/${p.slice(2)}.ts`));return m.exports;}
const search=load('lib/condition-search.ts'),pages=load('lib/condition-pages.ts');
test('aliases preserve disease scope and require explicit choices without discarding clinic names',()=>{
 for(const query of ['BPH Gangnam','enlarged prostate in Gangnam','전립선비대증 강남']){const m=search.matchConditionSearch(query);assert.equal(m.condition.slug,'bph');assert.equal(m.areas[0].slug,'gangnam');}
 assert.equal(search.matchConditionSearch('kidney stones Jamsil').condition.slug,'urinary-stones');
 assert.equal(search.matchConditionSearch('cystitis').areas.length,2);
 assert.equal(search.matchConditionSearch('BPH near me').nearby,true);
 for(const query of ['UTI Gangnam','burning pee','Goldman BPH Gangnam','cystitisplus','cystitis BPH'])assert.equal(search.matchConditionSearch(query),null);
});
test('expanded comparisons use only eligible verified identities and retain exact source geographies',()=>{
 assert.equal(pages.indexableConditionPages.length,10);
 assert.equal(pages.conditionMatches('bph','gangnam').length,82);
 assert.equal(pages.conditionMatches('urinary-stones','gangnam').length,24);
 assert.equal(pages.conditionMatches('urinary-stones','jamsil').length,4);
 assert.equal(pages.conditionMatches('not-a-condition','gangnam').length,0);
 assert.equal(pages.conditionMatches('bph','not-an-area').length,0);
 const scopes=JSON.parse(fs.readFileSync('lib/condition-scopes.json','utf8'));
 const coverage=JSON.parse(fs.readFileSync('lib/condition-coverage.json','utf8'));
 assert.equal(Object.values(scopes).filter(s=>s.comparisonEligible).length,coverage.summary.verified);
 assert.equal(coverage.selected,coverage.summary.verified+coverage.summary.no_record+coverage.summary.needs_review);
 for(const area of ['gangnam','jamsil'])for(const r of pages.conditionMatches('cystitis',area)){
  assert(scopes[r.ykiho].comparisonEligible);assert.equal(scopes[r.ykiho].area,area);
  assert.match(r.address,area==='jamsil'?/잠실동|신천동/:/^서울특별시 (강남구|서초구) /);
 }
 const measurement=load('lib/measurement.ts');const payload=measurement.measurementPayload('page_view','/conditions/cystitis/jamsil');assert.equal(payload.page_group,'results');assert(!JSON.stringify(payload).includes('cystitis'));assert(!JSON.stringify(payload).includes('jamsil'));
});
test('appointment guides keep known conditions and real comparison routes without adding symptom diagnoses',()=>{
 const guides=load('lib/condition-guides.ts');assert.equal(guides.conditionGuides.length,3);
 for(const g of guides.conditionGuides){assert(search.conditionCatalog.find(c=>c.slug===g.condition));assert(g.source.startsWith('https://www.nhs.uk/'));assert(g.questions.length>=4);for(const a of search.conditionAreas)assert(pages.conditionMatches(g.condition,a.slug).length>=3);assert.equal(guides.conditionGuidePath(g.condition),`/guides/urology-care/${g.condition}`);}
 assert.equal(guides.conditionGuidePath('burning-pee'),null);
});
