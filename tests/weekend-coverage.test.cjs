const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
function load(name){if(name.endsWith('.json'))return JSON.parse(fs.readFileSync('lib/'+name.slice(2),'utf8'));const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync('lib/'+name.slice(2)+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(m,m.exports,load);return m.exports;}
const {weekendCoverage:c,weekendCoverageCopy:copy}=load('./weekend-coverage');
test('coverage distinguishes the pilot from regional gaps and ambiguous station radii',()=>{
 assert.equal(c('gangnam','Gangnam'),'pilot');assert.equal(c('area-seoul-songpa-gu','Songpa-gu, Seoul'),'limited');
 assert.equal(c('busan','Busan'),'outside');assert.equal(c('siheung','Siheung-si'),'outside');
 assert.equal(c('kr-test','Sincheon-dong, Siheung-si, Gyeonggi'),'outside');
 assert.equal(c('kr-test','Sincheon-dong, Songpa-gu, Seoul'),'pilot');
 assert.equal(c('kr-test','Sincheon-dong'),'limited');assert.equal(c('jamsil-station','Jamsil',true),'limited');
 assert.equal(c('all','Korea'),'limited');assert.equal(c('seoul','Seoul'),'limited');
});
test('coverage copy does not equate missing data with closed clinics',()=>{
 for(const state of ['pilot','limited','outside'])assert.match(copy(state).description,/do(?:es)? not mean.*closed/);
});

