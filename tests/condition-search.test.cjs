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
test('only adequately supported exact scope combinations enter the index; smaller samples remain distinct',()=>{
 assert.deepEqual(pages.indexableConditionPages.map(p=>p.path),['/conditions/cystitis/gangnam','/conditions/cystitis/jamsil','/conditions/bph/jamsil','/conditions/neurogenic-bladder/jamsil']);
 assert.equal(pages.conditionMatches('bph','gangnam').length,2);
 assert.equal(pages.conditionMatches('urinary-stones','gangnam').length,0);
 assert.equal(pages.conditionMatches('urinary-stones','jamsil').length,2);
 for(const r of pages.conditionMatches('cystitis','jamsil'))assert.match(r.address,/잠실동|신천동/);
 const measurement=load('lib/measurement.ts');const payload=measurement.measurementPayload('page_view','/conditions/cystitis/jamsil');assert.equal(payload.page_group,'results');assert(!JSON.stringify(payload).includes('cystitis'));assert(!JSON.stringify(payload).includes('jamsil'));
});
