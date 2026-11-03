const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const React=require('react');

function load(file,imports={}){
 const m={exports:{}};
 new Function('module','exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText)(m,m.exports,n=>Object.hasOwn(imports,n)?imports[n]:require(n));
 return m.exports;
}
const contact=load('lib/clinic-contact.ts');
const Placeholder=()=>null;
const ClinicCard=load('components/ClinicCard.tsx',{
 '@/lib/clinic-contact':contact,
 '@/lib/goldman':{goldmanBranch:()=>null},
 '@/lib/card-location':{cardAddress:()=>({primary:'',korean:''})},
 '@/lib/clinic-evidence':{clinicFocus:()=>'',groupedDepartments:()=>[]},
 '@/lib/site':{clinicPath:()=>'/clinic'},
 '@/lib/detail-navigation':{clinicDetailLink:path=>path},
 '@/lib/clinic-library':{clinicSnapshot:clinic=>clinic},
 '@/components/ClinicLibrary':{SaveClinic:Placeholder},
 'next/link':Placeholder,
 'lucide-react':{MapPin:Placeholder},
 './MobileCardDetails':Placeholder,
 './RegistrationBadge':Placeholder,
 './ClinicContact':Placeholder,
}).default;

// Inspect the returned React tree, including children passed to mobile details.
function mapButtons(element){
 if(!React.isValidElement(element))return [];
 const children=React.Children.toArray(element.props.children).flatMap(mapButtons);
 return element.type==='button'&&element.props.children==='Show on map'?[element,...children]:children;
}
const located={id:'test-clinic',latitude:35.158,longitude:129.06};

test('mobile and desktop map buttons name each clinic and preserve the callback',()=>{
 const labels=[];
 for(const [names,expected] of [
  [{name_en:'  Alpha   Clinic  ',name_ko:'다른 이름'},'Alpha Clinic'],
  [{name_en:'',name_ko:'  베타   의원  '},'베타 의원'],
 ]){
  const calls=[];
  const onShowMap=event=>calls.push(event);
  const buttons=mapButtons(ClinicCard({clinic:{...located,...names},onShowMap}));
  assert.equal(buttons.length,2);
  for(const button of buttons){
   assert.equal(button.props['aria-label'],`Show on map for ${expected}`);
   assert.equal(button.props.children,'Show on map');
   assert.equal(button.props.type,'button');
   assert.equal(button.props.onClick,onShowMap);
   const event={type:'click'};
   button.props.onClick(event);
   assert.equal(calls.at(-1),event);
  }
  assert.equal(calls.length,2);
  labels.push(buttons[0].props['aria-label']);
 }
 assert.notEqual(labels[0],labels[1]);
});

test('both map buttons remain guarded by coordinates and callback availability',()=>{
 for(const coordinates of [
  {},{latitude:35.158},{latitude:NaN,longitude:129.06},
  {latitude:35.158,longitude:Infinity},{latitude:'35.158',longitude:129.06},
  {latitude:0,longitude:0},{latitude:37.5665,longitude:126.978},
 ]){
  assert.equal(mapButtons(ClinicCard({clinic:{id:'test-clinic',name_en:'Clinic',...coordinates},onShowMap:()=>{}})).length,0);
 }
 for(const onShowMap of [undefined,null]){
  assert.equal(mapButtons(ClinicCard({clinic:located,onShowMap})).length,0);
 }
});
