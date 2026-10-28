const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
test('failed emergency imports retain the existing public snapshot',()=>{
 const previous=fs.readFileSync('lib/emergency-directory.json'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'clinic-er-import-')),file=path.join(dir,'invalid.json');
 const row={hpid:'test-id',dutyName:'Example',dutyAddr:'서울특별시 중구 example',dutyTel3:'02-1234-5678',wgs84Lat:'37.5',wgs84Lon:'127',dutyEmcls:'G007',dutyEmclsName:'지역응급의료기관'};
 try{for(const fixture of [
  {summary:{complete:true,checkedAt:'2026-10-28T08:57:57Z',total:2},items:[row]},
  {summary:{complete:true,checkedAt:'2026-10-28T08:57:57Z',total:1},items:[{...row,dutyEmcls:'G999'}]},
  {summary:{complete:true,checkedAt:'2026-10-28T08:57:57Z',total:1},items:[row]},
 ]){fs.writeFileSync(file,JSON.stringify(fixture));const run=spawnSync('python',['scripts/refresh-emergency-directory.py','--input',file],{encoding:'utf8'});assert.notEqual(run.status,0);assert.deepEqual(fs.readFileSync('lib/emergency-directory.json'),previous);}}
 finally{if(fs.existsSync(file))fs.unlinkSync(file);fs.rmdirSync(dir);}
});
