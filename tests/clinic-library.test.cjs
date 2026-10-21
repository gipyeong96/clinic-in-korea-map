const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
const m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync('lib/clinic-library.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);const {readLibrary,updateLibrary,clinicSnapshot}=m.exports;
const clinic=n=>({id:String(n),path:'/clinics/detail/'+n,name:'Clinic '+n,nameKo:'병원',address:'서울',region:'Seoul'});
test('saved clinics survive recent visits, deduplicate and can be removed without changing other lists',()=>{
 let state={saved:[],recent:[]};state=updateLibrary(state,clinic(1),'save');state=updateLibrary(state,clinic(2),'visit');state=updateLibrary(state,clinic(1),'visit');state=updateLibrary(state,clinic(1),'visit');
 assert.deepEqual(state.recent.map(c=>c.id),['1','2']);assert.deepEqual(state.saved.map(c=>c.id),['1']);
 assert.deepEqual(readLibrary(JSON.stringify(state)),state);
 state=updateLibrary(state,clinic(1),'save');assert.equal(state.saved.length,0);assert.equal(state.recent.length,2);
 state=updateLibrary(state,clinic(1),'remove-recent');assert.deepEqual(state.recent.map(c=>c.id),['2']);
});
test('limits keep 20 recent profiles and never silently evict a saved clinic',()=>{
 let state={saved:[],recent:[]};for(let i=0;i<101;i++){state=updateLibrary(state,clinic(i),'save');state=updateLibrary(state,clinic(i),'visit');}
 assert.equal(state.saved.length,100);assert.equal(state.recent.length,20);assert.equal(state.saved[99].id,'0');assert.equal(state.recent[0].id,'100');
});
test('untrusted stored data cannot become external or script links; malformed storage is recoverable',()=>{
 for(const raw of [null,'bad','null','[]','{}'])assert.deepEqual(readLibrary(raw),{saved:[],recent:[]});
 const entries=[clinic(1),clinic(1),{...clinic(2),path:'https://evil.example'},{...clinic(3),path:'javascript:alert(1)'},{...clinic(4),name:null}];
 assert.deepEqual(readLibrary(JSON.stringify({saved:entries})).saved,[clinic(1)]);
 const snapshot=clinicSnapshot({id:'123',hira_code:'abc/def',name_en:'English name',name_ko:'병원',address_ko:'주소',address_region:{label:'Seoul'},telephone:'private-extra',query:'not stored'});
 assert.equal(snapshot.path,'/clinics/detail/abc%2Fdef');assert.equal(Object.keys(snapshot).length,6);
});
