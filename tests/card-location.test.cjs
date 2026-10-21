const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
const m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync('lib/card-location.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);const {cardAddress,nearbyStation}=m.exports;
test('English display preserves Korean taxi address and never invents a translation',()=>{
 assert.deepEqual(cardAddress({address_en:' English address ',address_ko:'한글 주소'}),{primary:'English address',korean:'한글 주소'});
 assert.equal(cardAddress({address_ko:'한글만'}).primary,'한글만');assert.equal(cardAddress({address_en:null}).primary,'');
});
test('nearby station uses nearest interchange coordinate within 2km and rejects missing or placeholder locations',()=>{
 const stations=[{slug:'far',name_en:'Far',stations:[{latitude:37.6,longitude:127}]},{slug:'near',name_en:'Near',stations:[{latitude:37.51,longitude:127},{latitude:37.5001,longitude:127}]}];
 const result=nearbyStation({latitude:37.5,longitude:127},stations);assert.equal(result.slug,'near');assert.ok(result.distance<12);
 for(const clinic of [{},{latitude:NaN,longitude:127},{latitude:37.5665,longitude:126.978},{latitude:35,longitude:129}])assert.equal(nearbyStation(clinic,stations),null);
});
