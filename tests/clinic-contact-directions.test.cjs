const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');

function load(file,imports={}){
 const m={exports:{}};
 new Function('module','exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText)(m,m.exports,n=>Object.hasOwn(imports,n)?imports[n]:require(n));
 return m.exports;
}
const contact=load('lib/clinic-contact.ts');
const ClinicContact=load('components/ClinicContact.tsx',{'@/lib/clinic-contact':contact}).default;
const render=(clinic,compact)=>renderToStaticMarkup(React.createElement(ClinicContact,{clinic,compact}));

test('directions name distinct clinics using normalized English or Korean fallback names',()=>{
 const labels=[];
 for(const [clinic,name,destination] of [
  [{name_en:'  Alpha   Clinic  ',name_ko:'다른 이름',latitude:35.158,longitude:129.06},'Alpha Clinic','35.158,129.06'],
  [{name_en:'  ',name_ko:'  베타   의원  ',address_ko:'  서울   테스트로 1  '},'베타 의원','서울 테스트로 1'],
 ]){
  for(const compact of [false,true]){
   const html=render(clinic,compact);
   const link=html.match(/<a\b[^>]*>Directions<\/a>/g);
   assert.equal(link?.length,1);
   assert(link[0].includes(`aria-label="Directions to ${name}"`));
   const href=contact.clinicDirections(clinic);
   assert.equal(href,`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`);
   assert(link[0].includes(`href="${href.replace(/&/g,'&amp;')}"`));
   assert(link[0].includes('target="_blank"'));
   assert(link[0].includes('rel="noopener noreferrer"'));
  }
  labels.push(`Directions to ${name}`);
 }
 assert.notEqual(labels[0],labels[1]);
});

test('directions stay absent without a usable address or coordinates',()=>{
 for(const clinic of [
  {},{address_ko:'  ',address_en:'\n'},
  {latitude:37.5665,longitude:126.978},
  {latitude:NaN,longitude:129.06},
 ]){
  for(const compact of [false,true]){
   assert.equal(contact.clinicDirections(clinic),null);
   assert.doesNotMatch(render(clinic,compact),/>Directions<\/a>|aria-label="Directions to /);
  }
 }
});
