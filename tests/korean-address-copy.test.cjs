const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const React=require('react');

// Exercise the component's real event handler and rerenders without a browser/DOM dependency.
function mount(props, clipboard){
 const slots=[];let cursor=0;
 const react={...React,useState(initial){const i=cursor++;if(!(i in slots))slots[i]=initial;return [slots[i],value=>{slots[i]=value;}];},useRef(initial){const i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i];}};
 const module={exports:{}};
 const source=ts.transpileModule(fs.readFileSync('components/KoreanAddressCopy.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
 new Function('require','module','exports','navigator',source)(name=>{assert.equal(name,'react');return react;},module,module.exports,{clipboard});
 const render=()=>{cursor=0;return module.exports.default(props);};
 function elements(node,type){if(!node||typeof node!=='object')return [];return [...(node.type===type?[node]:[]),...React.Children.toArray(node.props.children).flatMap(child=>elements(child,type))];}
 return {render,elements,button:()=>elements(render(),'button')[0],status:()=>elements(render(),'p').find(p=>p.props.role==='status').props.children};
}

test('copies only the Korean address and announces success only after clipboard resolves',async()=>{
 let resolve;const writes=[];const h=mount({primary:'English address',korean:'서울 서초구 서운로 12'}, {writeText(text){writes.push(text);return new Promise(r=>{resolve=r;});}});
 const button=h.button();assert.equal(button.props.type,'button');assert.equal(button.props.children,'Copy Korean address');
 assert.match(button.props.className,/focus-visible/);
 const operation=button.props.onClick();
 assert.equal(h.button().props.disabled,true);assert.equal(h.status(),'');
 await h.button().props.onClick();assert.deepEqual(writes,['서울 서초구 서운로 12']);
 resolve();await operation;
 assert.equal(h.status(),'Korean address copied.');assert.equal(h.button().props.disabled,false);
 const status=h.elements(h.render(),'p').find(p=>p.props.role==='status');
 assert.equal(status.props['aria-live'],'polite');assert.equal(status.props['aria-atomic'],'true');
});

test('rejection and missing Clipboard API preserve selectable text and permit retry',async()=>{
 for(const clipboard of [undefined,{writeText(){throw new Error('unavailable');}},{writeText(){return Promise.reject(new Error('denied'));}}]){
  const h=mount({primary:'English address',korean:'한글 주소'},clipboard);
  await h.button().props.onClick();
  assert.match(h.status(),/Could not copy.*manually/);assert.doesNotMatch(h.status(),/address copied/);
  assert.equal(h.button().props.disabled,false);
  const text=h.elements(h.render(),'p').find(p=>p.props.lang==='ko');
  assert.equal(text.props.children,'한글 주소');assert.match(text.props.className,/select-all/);
 }
 let fail=true;const h=mount({primary:'English',korean:'한글'}, {writeText(){return fail?Promise.reject(new Error('denied')):Promise.resolve();}});
 await h.button().props.onClick();fail=false;await h.button().props.onClick();assert.equal(h.status(),'Korean address copied.');
 fail=true;await h.button().props.onClick();assert.match(h.status(),/Could not copy/);
});

test('Korean-only primary addresses still have a copy button without duplicated address text',async()=>{
 const writes=[];const h=mount({primary:'한글 주소',korean:'한글 주소'},{async writeText(value){writes.push(value);}});
 assert.equal(h.elements(h.render(),'details').length,0);
 await h.button().props.onClick();assert.deepEqual(writes,['한글 주소']);
 const card=fs.readFileSync('components/ClinicCard.tsx','utf8');
 assert.match(card,/<KoreanAddressCopy key={address.korean} korean={address.korean} primary={address.primary}/);
 assert.match(card,/address.korean===address.primary\?'select-all'/);
});

test('no Korean address means no copy control',()=>{
 const h=mount({primary:'English only',korean:''},undefined);assert.equal(h.render(),null);
});
