const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
const sm={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync('lib/site.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(sm,sm.exports);
const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync('lib/clinic-library.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports,n=>n==='./site'?sm.exports:require(n));const {readLibrary,updateLibrary,clinicSnapshot}=m.exports;
const clinic=n=>({id:String(n),path:'/clinics/detail/'+n,name:'Clinic '+n,nameKo:'병원',address:'서울',region:'Seoul'});

function mountLibraryHook(initial){
 const states=[],effects=[],listeners=new Map(),writes=[];
 let cursor=0,mounted=false,readFails=true,writeFails=false,raw=JSON.stringify(initial);
 const react={
  useState(value){const index=cursor++;if(!mounted)states[index]=value;return [states[index],next=>{states[index]=typeof next==='function'?next(states[index]):next;}];},
  useEffect(effect){if(!mounted)effects.push(effect);},
 };
 const storage={
  getItem(key){assert.equal(key,m.exports.LIBRARY_KEY);if(readFails)throw Error('read unavailable');return raw;},
  setItem(key,value){assert.equal(key,m.exports.LIBRARY_KEY);if(writeFails)throw Error('write unavailable');writes.push(value);raw=value;},
 };
 const window={
  addEventListener(type,listener){listeners.set(type,listener);},
  removeEventListener(type,listener){assert.equal(listeners.get(type),listener);listeners.delete(type);},
  dispatchEvent(event){listeners.get(event.type)?.();},
 };
 const module={exports:{}};
 const source=fs.readFileSync('components/ClinicLibrary.tsx','utf8')+'\nexport {useLibrary};';
 new Function('module','exports','require','localStorage','window',ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText)(module,module.exports,name=>{
  if(name==='react')return react;
  if(name==='@/lib/clinic-library')return m.exports;
  if(name==='@/lib/measurement')return {measure(){assert.fail('refresh must not emit analytics');}};
  if(name==='next/link'||name==='@/components/ClinicComparison')return {};
  return require(name);
 },storage,window);
 const render=()=>{cursor=0;return module.exports.useLibrary();};
 render();mounted=true;
 const cleanups=effects.map(effect=>effect());
 return {
  render,writes,
  allowReads(){readFails=false;},
  failReads(){readFails=true;},
  failWrites(){writeFails=true;},
  refresh(type){assert.ok(listeners.has(type));window.dispatchEvent(new Event(type));},
  stored(){return JSON.parse(raw);},
  unmount(){cleanups.forEach(cleanup=>cleanup());assert.equal(listeners.size,0);},
 };
}

for(const event of ['clinic-library','storage']){
 test(`useLibrary recovers saved/recent data and clears read error on ${event} refresh`,()=>{
  const data={saved:[clinic(1),clinic(2)],recent:[clinic(3),clinic(1)]};
  const hook=mountLibraryHook(data);
  assert.equal(hook.render().ready,true);
  assert.equal(hook.render().error,'Storage is unavailable. Allow browser storage to save clinics.');
  assert.deepEqual(hook.render().library,{saved:[],recent:[]});
  hook.allowReads();hook.refresh(event);
  assert.equal(hook.render().error,'');
  assert.equal(hook.render().ready,true);
  assert.deepEqual(hook.render().library,data);
  hook.failReads();hook.refresh(event);
  assert.equal(hook.render().error,'Storage is unavailable. Allow browser storage to save clinics.');
  assert.deepEqual(hook.render().library,data);
  assert.deepEqual(hook.stored(),data);assert.deepEqual(hook.writes,[]);
  hook.unmount();
 });
 test(`useLibrary retains unavailable-storage error when ${event} refresh still fails`,()=>{
  const hook=mountLibraryHook({saved:[clinic(1)],recent:[clinic(2)]});
  hook.refresh(event);
  assert.equal(hook.render().error,'Storage is unavailable. Allow browser storage to save clinics.');
  assert.equal(hook.render().ready,true);
  assert.deepEqual(hook.writes,[]);hook.unmount();
 });
}

test('useLibrary preserves change errors on failed reads and writes after recovery',()=>{
 const data={saved:[clinic(1)],recent:[clinic(2)]};const hook=mountLibraryHook(data);
 hook.allowReads();hook.refresh('storage');
 hook.failWrites();hook.render().change(clinic(1),'save');
 assert.equal(hook.render().error,'Could not save changes. Browser storage may be unavailable or full.');
 assert.deepEqual(hook.render().library,data);
 hook.failReads();hook.render().change(clinic(2),'remove-recent');
 assert.equal(hook.render().error,'Could not save changes. Browser storage may be unavailable or full.');
 assert.deepEqual(hook.stored(),data);assert.deepEqual(hook.writes,[]);hook.unmount();
});

test('legacy branch saves normalize without mutating input, losing unrelated records or combining branches',()=>{
 const legacy={...clinic('85ed27c9-0b6e-45c6-81ee-5d81fe36a2fc'),name:'Saved name'};
 const raw={saved:[clinic('other'),legacy,clinic('goldman-gangnam'),clinic('goldman-jamsil')],recent:[legacy,clinic('other')]};
 const before=JSON.stringify(raw);const normalized=readLibrary(before);
 assert.deepEqual(normalized.saved.map(c=>c.id),['other','goldman-gangnam','goldman-jamsil']);assert.equal(normalized.saved[1].name,'Saved name');assert.equal(normalized.saved[1].path,'/clinics/detail/goldman-gangnam');assert.equal(JSON.stringify(raw),before);
 const removed=updateLibrary(normalized,legacy,'save');assert.deepEqual(removed.saved.map(c=>c.id),['other','goldman-jamsil']);assert.equal(removed.recent.length,2);
 const hira=sm.exports.unifiedClinicRecords[0].hira;
 assert.equal(clinicSnapshot({id:'db-id',hira_code:hira}).id,'goldman-gangnam');
});
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
