const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
const m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync('lib/jamsil-scope.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);
test('Jamsil-dong comparison requires a qualified source address and excludes Sincheon-dong and namesakes',()=>{
 for(const address of ['서울특별시 송파구 올림픽로 119, (잠실동)','서울 송파구 올림픽로 119, (잠실동, 상가)'])assert.equal(m.exports.isJamsilDong(address),true);
 for(const address of ['서울특별시 송파구 송파대로 562, (신천동)','부산광역시 사상구 잠실비뇨기과','서울특별시 강남구 길 1, (잠실동)',null,''])assert.equal(m.exports.isJamsilDong(address),false);
});
