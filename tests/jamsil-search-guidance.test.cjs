const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('app/clinics/[department]/[location]/page.tsx','utf8');

test('Jamsil search input describes the active geographic scope',()=>{
  assert.match(source,/const jamsilScope = params\.department==='urology'&&\['jamsil','jamsil-station'\]\.includes\(params\.location\)/);
  assert.match(source,/aria-describedby=\{jamsilScope\?'jamsil-search-scope-hint':undefined\}/);
  assert.match(source,/id="jamsil-search-scope-hint"/);
  assert.match(source,/within \$\{radius\.toLocaleString\(\)\} m of Jamsil Station/);
  assert.match(source,/limited to Jamsil-dong/);
});
