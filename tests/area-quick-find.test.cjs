const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
const m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync('lib/area-quick-find.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);const {findAreas}=m.exports;
const child={id:'bundang',en:'Bundang-gu',ko:'분당구',href:'/clinics/dentistry/bundang?specialist=1'};
const items=[{id:'seongnam',en:'Seongnam-si',ko:'성남시',href:'/seongnam',children:[child]},{id:'anyang',en:'Anyang-si',ko:'안양시',href:'/anyang'}];
test('areas sort without mutating the source and district matches retain their parent and selected links',()=>{
 assert.deepEqual(findAreas(items,'').map(x=>x.id),['anyang','seongnam']);assert.equal(items[0].id,'seongnam');
 for(const query of ['BUNDANG','bun dang','분당']){const result=findAreas(items,query);assert.equal(result.length,1);assert.equal(result[0].id,'seongnam');assert.equal(result[0].children[0].href,child.href);}
 assert.equal(findAreas(items,'성남')[0].children.length,1);assert.deepEqual(findAreas(items,'no such area'),[]);
});
