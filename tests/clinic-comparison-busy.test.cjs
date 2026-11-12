const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');

// Supply render states directly: no effects, requests or hook changes are needed
// to verify that the labelled section exposes the existing busy state.
function renderComparison({busy,rows=null,error='',selectedCount=2}){
 const states=[rows,busy,error,'2026-11-12T00:00:00Z'];
 const imports={
  react:{...React,useState:()=>[states.shift(),()=>{}],useRef:()=>({current:null}),useEffect:()=>{}},
  'next/link':({children,...props})=>React.createElement('a',props,children),
  '@/lib/measurement':{measure:()=>{}},
 };
 const m={exports:{}};
 const source=ts.transpileModule(fs.readFileSync('components/ClinicComparison.tsx','utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true},
 }).outputText;
 new Function('module','exports','require',source)(m,m.exports,n=>Object.hasOwn(imports,n)?imports[n]:require(n));
 const selected=Array.from({length:selectedCount},(_,i)=>({name:`Clinic ${i}`,path:`/clinics/${i}`}));
 return renderToStaticMarkup(React.createElement(m.exports.default,{selected}));
}

for(const [name,state] of [
 ['idle',{busy:false}],
 ['idle with too few selections',{busy:false,selectedCount:1}],
 ['loading',{busy:true}],
 ['refreshing completed results',{busy:true,rows:[]}],
 ['completed',{busy:false,rows:[]}],
 ['failed',{busy:false,error:'Comparison could not be loaded.'}],
]){
 test(`comparison section exposes aria-busy when ${name}`,()=>{
  const html=renderComparison(state);
  const section=html.match(/^<section\b([^>]*)>/);
  assert.ok(section);
  assert.match(section[1],/aria-labelledby="compare-heading"/);
  assert.match(section[1],new RegExp(`aria-busy="${state.busy}"`));
  assert.match(html,/<h2\b[^>]*id="compare-heading"/);
  const button=html.match(/<button\b([^>]*)>([^<]*)<\/button>/);
  assert.ok(button);
  assert.equal(/\bdisabled=""/.test(button[1]),state.busy||state.selectedCount===1);
  assert.equal(button[2],state.busy?'Loading comparison…':state.rows?'Refresh comparison':'Compare selected clinics');
 });
}
