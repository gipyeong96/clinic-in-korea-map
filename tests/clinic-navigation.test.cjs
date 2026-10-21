const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
function load(file,requireFn=require){const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(m,m.exports,requireFn);return m.exports;}
const {clinicRegion}=load('lib/clinic-region.ts',()=>require('../lib/national-areas.json'));
const {searchReturnPath,clinicDetailLink}=load('lib/detail-navigation.ts');

test('address-derived regions override stale relations and distinguish same-name districts',()=>{
  const gwangju=clinicRegion({address_ko:'전남광주통합특별시 서구 상무중앙로 95',locations:{slug:'seoul',name_en:'seoul'}});
  assert.deepEqual(gwangju,{slug:'area-gwangju-seo-gu',label:'Seo-gu, Gwangju'});
  assert.equal(clinicRegion({address_ko:'부산광역시 서구 구덕로 1'}).slug,'area-busan-seo-gu');
  assert.equal(clinicRegion({address_ko:'전남광주통합특별시 목포시 영산로 1'}).label,'Mokpo-si, Jeollanam-do');
  assert.equal(clinicRegion({address_ko:'경기도 성남시 분당구 돌마로 1'}).label,'Bundang-gu, Seongnam-si, Gyeonggi');
  assert.equal(clinicRegion({address_ko:'서울   서초구 서운로 12'}).label,'Seocho-gu, Seoul');
  assert.equal(clinicRegion({address_ko:'제주특별자치도 서귀포시 중앙로 1'}).label,'Seogwipo-si, Jeju');
  assert.equal(clinicRegion({address_ko:'unknown',locations:{name_en:'seoul'}}),null);
  assert.equal(clinicRegion({}),null);
});

test('detail links round-trip every search condition and selected card without changing canonical paths',()=>{
  const source='/clinics/dentistry/seoul-station?q='+encodeURIComponent('서울 dental')+'&specialist=1&radius=1000&page=3';
  const path='/clinics/detail/clinic-1';
  const detail=clinicDetailLink(path,source,'uuid-123');
  const url=new URL(detail,'https://example.com');
  assert.equal(url.pathname,path);
  assert.equal(searchReturnPath(url.searchParams.get('returnTo')),source+'#clinic-card-uuid-123');
  assert.equal(clinicDetailLink(path),path);
  assert.equal(clinicDetailLink(path,'https://evil.example'),path);
});

test('return destinations reject external URLs, nested detail pages and malformed filters',()=>{
  for(const value of [undefined,['/clinics/all/all'],'https://evil.example','//evil.example/clinics/all/all','/clinics/detail/foo','/clinics/all/all/../detail','/clinics/all/all?returnTo=https://evil.example','/clinics/all/all?page=-1','/clinics/all/all?radius=999','/clinics/all/all?specialist=0','/clinics/all/all?page=2&page=3','/clinics/all/all#javascript:alert(1)','/clinics/all/all?q='+('x'.repeat(201))])assert.equal(searchReturnPath(value),null,JSON.stringify(value));
  assert.equal(searchReturnPath('/clinics/all/all?page=10000'),'/clinics/all/all?page=10000');
});
