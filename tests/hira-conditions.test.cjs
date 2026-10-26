const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
const m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync('lib/hira-conditions.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);
const record={ykiho:'exact-id',clinicName:'Example',referenceMonth:'202604',checkedAt:'2026-10-26',conditions:['감기','당뇨병'],verified:true};
test('condition evidence requires exact institution identity, valid period, positive verification and actual names',()=>{
 assert.deepEqual(m.exports.conditionRecord(record,'exact-id').conditions,['감기','당뇨병']);
 for(const invalid of [null,{...record,verified:false},{...record,referenceMonth:'202613'},{...record,referenceMonth:'202701'},{...record,checkedAt:'2026-02-31'},{...record,conditions:[]},{...record,conditions:Array(6).fill('감기')},{...record,conditions:[null]}])assert.equal(m.exports.conditionRecord(invalid,'exact-id'),null);
 assert.equal(m.exports.conditionRecord(record,'different-id'),null);
 assert.equal(m.exports.referenceLabel('202402'),'February 2024');
});
test('pilot records retain identity, original names, source order and actual reference month',()=>{
 const records=JSON.parse(fs.readFileSync('lib/hira-condition-pilot.json','utf8').replace(/^\uFEFF/,''));assert.equal(Object.keys(records).length,27);
 for(const [key,record] of Object.entries(records)){const result=m.exports.conditionRecord(record,key);assert(result);assert.equal(result.referenceMonth,'202604');assert.deepEqual(result.conditions,record.conditions);assert(result.clinicName);}
});
