const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
const moduleCode=ts.transpileModule(fs.readFileSync('lib/clinic-contact.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;const m={exports:{}};new Function('module','exports',moduleCode)(m,m.exports);const c=m.exports;
test('call links keep valid Korean area codes and support international dialling',()=>{
 assert.equal(c.clinicPhone('02-555-7900').href,'tel:+8225557900');assert.equal(c.clinicPhone('051-809-2861').href,'tel:+82518092861');assert.equal(c.clinicPhone('+82 51 809 2861').href,'tel:+82518092861');assert.equal(c.clinicPhone('1588-1234').href,'tel:15881234');assert.equal(c.clinicPhone('0507-1234-5678').href,'tel:+8250712345678');
});
test('missing area codes and contaminated strings cannot produce an unsafe call link',()=>{
 for(const v of ['',null,'02','0','555-7900','000-0000','051-809-2861 CT','javascript:alert(1)','099-123-4567'])assert.equal(c.clinicPhone(v).href,null,String(v));assert.equal(c.clinicPhone('555-7900').reason,'area-code-missing');
});
test('representative numbers with source area prefixes never become geographic international links',()=>{
 for(const value of ['02-1833-8171','031-1833-8171','+82 2 1833 8171','1833-8171']){const phone=c.clinicPhone(value);assert.equal(phone.display,'1833-8171');assert.equal(phone.href,'tel:18338171');assert.match(phone.note,/domestic/);}
 assert.equal(c.clinicPhone('02-1566-7450').href,'tel:15667450');
 assert.equal(c.clinicPhone('02-2183-3817').href,'tel:+82221833817');
 assert.equal(c.clinicPhone('1833-8171 ext 2').href,null);
 assert.equal(c.clinicPhone('02-555-7900').note,null);
});
test('directions use real coordinates or an exact address, never placeholder coordinates',()=>{
 const clinic={latitude:35.158,longitude:129.06,address_ko:'부산광역시 부산진구 중앙대로 736'};assert.equal(new URL(c.clinicDirections(clinic)).searchParams.get('destination'),'35.158,129.06');assert.equal(new URL(c.clinicDirections({...clinic,latitude:37.5665,longitude:126.978})).searchParams.get('destination'),clinic.address_ko);assert.equal(c.clinicDirections({}),null);assert(!c.hasClinicCoordinates({...clinic,latitude:NaN}));
});
test('names and addresses preserve source text and have readable fallbacks',()=>{
 assert.equal(c.clinicName({name_ko:'  예바치과  ',name_en:''}),'예바치과');assert.equal(c.clinicAddress({address_ko:'부산  중앙대로 736',address_en:'Approximate translated address'}),'부산 중앙대로 736');
});
