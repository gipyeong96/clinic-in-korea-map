const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync('lib/bph-navigation.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);
const {matchBphSearch:match}=m.exports;
test('BPH procedure intent links to fixed guide anchors and location directories',()=>{
 for(const q of ['HoLEP surgery in Korea','홀렙수술','holmium laser enucleation of the prostate'])assert.equal(match(q).guideHref,'/guides/urology-care/bph#procedure-holep',q);
 for(const q of ['Aquablation','아쿠아블레이션 수술'])assert.equal(match(q).guideHref,'/guides/urology-care/bph#procedure-aquablation',q);
 for(const q of ['Rezūm','water-vapour therapy','리줌시술'])assert.equal(match(q).guideHref,'/guides/urology-care/bph#procedure-rezum',q);
 assert.equal(match('전립선비대증수술').guideHref,'/guides/urology-care/bph#treatment-options');
 assert.equal(match('BPH treatment Gangnam').directoryHref,'/clinics/urology/gangnam');
 assert.equal(match('HoLEP 서울역').directoryHref,'/clinics/urology/seoul-station');
 assert.equal(match('Rezum near me').directoryHref,'/nearby?department=urology');
 assert.equal(match('HoLEP vs Aquablation').guideHref,'/guides/urology-care/bph#treatment-options');
 assert.equal(match('Rezum cost').guideHref,'/guides/urology-care/bph#costs-and-quotes');
 assert.equal(match('HoLEP recovery').guideHref,'/guides/urology-care/bph#travel-and-follow-up');
});
test('unknown names and mixed conditions remain literal searches',()=>{
 for(const q of ['Goldman HoLEP','HoLEP Dr Kim','HoLEP kidney stones','holeplus','Rezum Busan Gangnam','HoLEP cheap','https://example.com/HoLEP','x'.repeat(201)])assert.equal(match(q),null,q);
});
test('guide keeps shared partner cards and historical records; procedure queries do not become analytics paths',()=>{
 const guide=fs.readFileSync('components/BphPlanningGuide.tsx','utf8');
 assert.match(guide,/<PartnerClinicCards ids=\{goldmanBranches\.map/);
 assert.match(guide,/conditionMatches\('bph',a.slug\)/);
 for(const q of ['HoLEP','Aquablation cost','Rezūm Gangnam'])assert(!match(q).directoryHref.includes('q='));
 const measurement={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync('lib/measurement.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(measurement,measurement.exports);
 const payload=JSON.stringify(measurement.exports.measurementPayload('page_view','/guides/urology-care/bph#procedure-holep'));
 assert(!/bph|holep|rezum|aquablation/i.test(payload));
});
