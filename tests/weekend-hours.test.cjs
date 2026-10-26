const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const records=JSON.parse(fs.readFileSync('lib/weekend-hours-pilot.json','utf8'));
const m={exports:{}};
new Function('module','exports','require',ts.transpileModule(fs.readFileSync('lib/weekend-hours.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(m,m.exports,()=>records);
const {weekendHours,hoursLabel}=m.exports;
test('hours require matching current identity, not just a directory identifier',()=>{
 const [id,r]=Object.entries(records)[0];
 assert.ok(weekendHours(id,r.name,r.address,r.telephone));
 assert.equal(weekendHours(id,'Other clinic',r.address,r.telephone),null);
 assert.equal(weekendHours(id,r.name,'Other address',r.telephone),null);
 assert.equal(weekendHours(id,r.name,r.address,'02-000-0000'),null);
 assert.equal(weekendHours('missing',r.name,r.address,r.telephone),null);
});
test('missing, invalid and overnight schedules never imply closed or normal opening hours',()=>{
 for(const h of [{status:'not_reported'},{status:'reported_schedule',start:'25:00',end:'26:00'},{status:'reported_schedule',start:'18:00',end:'09:00'},{status:'reported_schedule',start:'09:00',end:'09:00'}])assert.equal(hoursLabel(h),'Hours not provided');
 assert.equal(hoursLabel({status:'reported_schedule',start:'09:00',end:'13:00'}),'09:00–13:00');
});
