const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const ts=require(process.cwd()+'/node_modules/typescript');
function load(file){const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports,n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n));return m.exports;}
const d=load('lib/urology-discovery.ts');
test('comparison routing uses qualified addresses, including Sincheon, never similar clinic names',()=>{
 assert.equal(d.urologyComparisonForAddress('서울특별시 송파구 송파대로 562, (신천동)'), 'jamsil-station');
 assert.equal(d.urologyComparisonForAddress('서울특별시 송파구 올림픽로 119, (잠실동)'), 'jamsil-station');
 assert.equal(d.urologyComparisonForAddress('서울특별시 서초구 서운로 12'), 'area-seoul-seocho-gu');
 assert.equal(d.urologyComparisonForAddress('부산광역시 사상구 잠실비뇨기과'), undefined);
 assert.equal(d.urologyComparisonForAddress(null),undefined);
});
test('Jamsil-dong is not expanded to include Sincheon partner and branch metadata stays distinct',()=>{
 assert.deepEqual(d.urologyAreas.jamsil.branches,[]);
 assert.deepEqual(d.urologyAreas['jamsil-station'].branches,['goldman-jamsil']);
 assert.match(d.urologyAreas['area-incheon-namdong-gu'].scope,/not a Guwol-dong-only/);
 const ids=Object.keys(d.goldmanComparison),titles=ids.map(id=>d.goldmanSearchMetadata(id).title);
 assert.equal(ids.length,5);assert.equal(new Set(titles).size,5);
 assert.equal(d.goldmanSearchMetadata('unrelated-clinic'),undefined);
 for(const id of ids)assert(d.urologyAreas[d.goldmanComparison[id]]);
});
