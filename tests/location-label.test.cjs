const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
function load(file,imports={}){const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(m,m.exports,n=>imports[n]||require(n));return m.exports;}
const catalog=require('../lib/national-areas.json');
const location=load('lib/location-label.ts',{'./national-regions':{nationalAreas:catalog.areas,nationalProvinces:catalog.provinces}});
const rows=[
 {id:1,parent_id:null,slug:'busan',name_ko:'부산광역시',name_en:'부산광역시'},
 {id:2,parent_id:1,slug:'district',name_ko:'수영구',name_en:'수영구'},
 {id:3,parent_id:2,slug:'kr-6ded571095b0019681591048a192a00d',name_ko:'광안동',name_en:'gwangandong'},
 {id:4,parent_id:null,slug:'incheon',name_ko:'인천광역시',name_en:'인천광역시'},
 {id:5,parent_id:4,slug:'bupyeong',name_ko:'부평구',name_en:'부평구'},
 {id:6,parent_id:5,slug:'sipjeong',name_ko:'십정동',name_en:'sipjeongdong'},
 {id:7,parent_id:null,slug:'seoul',name_ko:'서울특별시',name_en:'서울특별시'},
 {id:8,parent_id:7,slug:'dongdaemun',name_ko:'동대문구',name_en:'동대문구'},
 {id:9,parent_id:8,slug:'jegi',name_ko:'제기동',name_en:'jegidong'},
];
test('indexed legacy locations retain the exact neighbourhood and verified parent scope',()=>{
 assert.equal(location.locationHierarchyLabel(rows,rows[2].slug),'Gwangan-dong, Suyeong-gu, Busan');
 assert.equal(location.locationHierarchyLabel(rows,'sipjeong'),'Sipjeong-dong, Bupyeong-gu, Incheon');
 assert.equal(location.locationHierarchyLabel(rows,'jegi'),'Jegi-dong, Dongdaemun-gu, Seoul');
 assert.equal(location.locationHierarchyLabel([...rows,{...rows[2],id:10,slug:'another-gwangan',parent_id:5}],'another-gwangan'),'Gwangan-dong, Bupyeong-gu, Incheon');
});
test('missing ancestry, cycles and unsupported roots cannot become inferred locations',()=>{
 assert.equal(location.locationHierarchyLabel(rows,'missing'),null);
 assert.equal(location.locationHierarchyLabel(rows.filter(r=>r.id!==2),rows[2].slug),null);
 assert.equal(location.locationHierarchyLabel(rows.map(r=>r.id===1?{...r,parent_id:3}:r),rows[2].slug),null);
 assert.equal(location.locationHierarchyLabel([{...rows[2],parent_id:null}],rows[2].slug),null);
});
test('server lookup reads bounded exact IDs only; errors produce no misleading label',async()=>{
 const calls=[];let failure=false;
 const db={from(table){assert.equal(table,'locations');return {select(fields){assert.equal(fields,'id,parent_id,slug,name_ko,name_en');return this;},eq(key,value){calls.push([key,value]);this.row=rows.find(r=>r[key]===value);return this;},async maybeSingle(){return {data:this.row,error:failure?{message:'offline'}:null};}};}};
 const resolver=load('lib/registered-location.ts',{'react':{cache:f=>f},'next/cache':{unstable_cache:f=>f},'./supabase':{supabase:db},'./location-label':location});
 assert.equal(await resolver.registeredLocationLabel(rows[2].slug),'Gwangan-dong, Suyeong-gu, Busan');
 assert.deepEqual(calls,[['slug',rows[2].slug],['id',2],['id',1]]);
 failure=true;assert.equal(await resolver.registeredLocationLabel(rows[2].slug),null);
 const n=calls.length;assert.equal(await resolver.registeredLocationLabel('x'.repeat(101)),null);assert.equal(calls.length,n);
});
