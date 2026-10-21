const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
function load(file){const m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);return m.exports;}
const {goldmanBranches,goldmanBranch,goldmanLocationUrl}=load('lib/goldman.ts');const {clinicPhone}=load('lib/clinic-contact.ts');
test('five official branches keep distinct verified numbers, source tabs and branch-specific schedules',()=>{
 const expected=['+8225567533','+8227737522','+82322211911','+82313737532','+8224217511'];
 assert.equal(goldmanBranches.length,5);assert.equal(new Set(goldmanBranches.map(b=>b.tab)).size,5);
 goldmanBranches.forEach((b,i)=>{assert.equal(clinicPhone(b.phone).href,'tel:'+expected[i]);assert.equal(new URL(goldmanLocationUrl(b.tab)).searchParams.get('tab'),String(b.tab));});
 assert.match(goldmanBranch('goldman-dongtan').weekday,/closed Wednesdays/);assert.match(goldmanBranch('goldman-dongtan').saturday,/15:00/);
 assert.deepEqual(goldmanBranches.filter(b=>b.stone24).map(b=>b.name),['Gangnam','Seoul Station','Jamsil']);assert.equal(goldmanBranch('unrelated-clinic'),undefined);
});

test('Dongtan and Jamsil homepage cards retain source phones and resolvable stable detail IDs',()=>{
 const {additionalGoldmanClinics,additionalGoldmanClinic}=load('lib/goldman.ts');
 assert.deepEqual(additionalGoldmanClinics.map(c=>c.id),['goldman-dongtan','goldman-jamsil']);
 for(const c of additionalGoldmanClinics){assert.equal(c.telephone,goldmanBranch(c.id).phone);assert.equal(additionalGoldmanClinic(c.id),c);assert.equal(c.latitude,undefined);assert.equal(c.categories.slug,'urology');}
 assert.equal(additionalGoldmanClinic('goldman-incheon'),undefined);
});
