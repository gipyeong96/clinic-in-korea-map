const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');

function renderComparison(profiles){
 const states=[profiles.map(profile=>({id:profile.id,status:'ok',profile})),false,'','2026-11-07T00:00:00Z'];
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
 return renderToStaticMarkup(React.createElement(m.exports.default,{selected:profiles}));
}
const profiles=[
 {id:'alpha',name:'Alpha Clinic',path:'/clinics/alpha',directions:'https://www.google.com/maps/dir/?api=1&destination=Alpha',departments:[],phone:{}},
 {id:'beta',name:'베타 의원',path:'/clinics/beta',directions:'https://www.google.com/maps/dir/?api=1&destination=Beta',departments:[],phone:{}},
];
function links(html,text){
 return [...html.matchAll(/<a\b([^>]*)>([^<]*)<\/a>/g)].filter(match=>match[2]===text).map(match=>match[1]);
}

test('desktop and mobile comparison actions name each clinic and preserve visible text and destinations',()=>{
 const html=renderComparison(profiles);
 const profileLinks=links(html,'View clinic profile');
 const directionsLinks=links(html,'Directions ↗');
 assert.equal(profileLinks.length,4);
 assert.equal(directionsLinks.length,4);
 // Both responsive layouts retain selection order and the same link attributes.
 for(const [index,profile] of [...profiles,...profiles].entries()){
  assert.ok(profileLinks[index].includes(`aria-label="View clinic profile for ${profile.name}"`));
  assert.ok(profileLinks[index].includes(`href="${profile.path}"`));
  assert.doesNotMatch(profileLinks[index],/\b(?:target|rel)=/);
  assert.ok(directionsLinks[index].includes(`aria-label="Directions to ${profile.name}"`));
  assert.ok(directionsLinks[index].includes(`href="${profile.directions.replace(/&/g,'&amp;')}"`));
  assert.ok(directionsLinks[index].includes('target="_blank"'));
  assert.ok(directionsLinks[index].includes('rel="noopener noreferrer"'));
 }
});

test('comparison omits unavailable directions in both layouts while retaining profile links',()=>{
 const html=renderComparison(profiles.map(profile=>({...profile,directions:null})));
 assert.equal(links(html,'View clinic profile').length,4);
 assert.equal(links(html,'Directions ↗').length,0);
 assert.doesNotMatch(html,/aria-label="Directions to /);
});
