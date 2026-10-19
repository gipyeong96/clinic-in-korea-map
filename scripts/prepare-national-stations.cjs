// Input: unmodified official KRIC XLSX files and data.go.kr 15067652 CSV.
const fs = require('node:fs');
const xlsx = require('./node_modules/xlsx');
const crypto = require('node:crypto');
const root = require('node:path').join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(`${root}/data/rail/manifest.json`, 'utf8').replace(/^\uFEFF/, ''));
const issues = [];
const clean = v => String(v ?? '').trim();
const key = v => clean(v).replace(/\s/g, '').replace(/[ㆍ・]/g, '·').replace(/\([^)]*\)/g, '').replace(/역$/, '');
function date(v, fallback) {
  if (typeof v === 'number' && v < 100000) { const d=xlsx.SSF.parse_date_code(v); return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`; }
  const s=clean(v).replace(/[^0-9]/g,'');
  return /^20\d{6}$/.test(s) ? `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}` : fallback;
}
const names = {'신분당선':'Shinbundang','인천국제공항선':'Airport Railroad','공항철도':'Airport Railroad','에버라인':'EverLine','용인경량전철':'EverLine','의정부':'Uijeongbu','김포도시철도':'Gimpo Goldline','우이신설선':'Ui-Sinseol','신림선':'Sillim','경원선':'Line 1','경부선':'Line 1','경인선':'Line 1','장항선':'Line 1','경의중앙선':'Gyeongui-Jungang','경의선':'Gyeongui-Jungang','경춘선':'Gyeongchun','경강선':'Gyeonggang','분당선':'Suin-Bundang','수인선':'Suin-Bundang','수인분당선':'Suin-Bundang','동해선':'Donghae','서해선':'Seohae','진접선':'Line 4'};
Object.assign(names, {'대경선':'Daegyeong','안산과천선':'Line 4','일산선':'Line 3','공항철도선':'Airport Railroad','김포골드라인':'Gimpo Goldline','자기부상':'Airport Maglev','자기부상철도':'Airport Maglev'});
function lineName(v) {const s=clean(v).replace(/\s/g,''); return names[s] || (s.match(/([1-9])호선/) ? `Line ${s.match(/([1-9])호선/)[1]}` : s.includes('부산김해') ? 'Busan-Gimhae' : s.includes('신림') ? 'Sillim' : s.includes('GTX') ? 'GTX-A' : clean(v));}
function cityFor(title, address, lat, lon) {
  if(lat>124 && lon<39) [lat,lon]=[lon,lat];
  if (/부산|김해/.test(title)) return 'Busan · Ulsan · Gimhae';
  if (/대구/.test(title)) return 'Daegu';
  if (/광주/.test(title)) return 'Gwangju';
  if (/대전/.test(title)) return 'Daejeon';
  if (lat>35.6&&lat<36.3&&lon>128.2&&lon<129) return 'Daegu';
  if (lat < 35.7 && lon > 128.5) return 'Busan · Ulsan · Gimhae';
  return 'Seoul · Incheon · Gyeonggi';
}
function coords(lat, lon, city) {
  lat=Number(lat); lon=Number(lon);
  // Some official sheets invert the two columns; only swap when unambiguous.
  if(lat>124 && lon<39) [lat,lon]=[lon,lat];
  if(!(lat>=33 && lat<=39 && lon>=124 && lon<=132)) return null;
  if(city==='Daegu' && !(lat>35.6&&lat<36.2&&lon>128.2&&lon<129)) return null;
  if(city==='Busan · Ulsan · Gimhae' && !(lat>34.9&&lat<35.7&&lon>128.7&&lon<129.6)) return null;
  if(city==='Gwangju' && !(lat>35&&lat<35.3&&lon>126.7&&lon<127)) return null;
  if(city==='Daejeon' && !(lat>36.2&&lat<36.5&&lon>127.2&&lon<127.6)) return null;
  return {latitude:lat,longitude:lon};
}
const rows=[];
// Standard names + coordinate-bearing history sheets. Latest row wins for a line/name.
for(const m of manifest.filter(m=>m.format==='xlsx' && !['32','1294'].includes(m.id))) {
  const w=xlsx.readFile(`${root}/data/rail/${m.id}.xlsx`);
  for(const sheet of w.SheetNames) {
    const a=xlsx.utils.sheet_to_json(w.Sheets[sheet],{header:1});
    const h=a.findIndex(r=>r.some(v=>['역위도','역위치(위도)'].includes(clean(v).replace(/\s/g,''))));
    if(h<0) continue;
    const headers=a[h].map(v=>clean(v).replace(/\s/g,''));
    for(let n=h+1;n<a.length;n++) {
      const r=Object.fromEntries(headers.map((k,i)=>[k,a[n][i]]));
      const ko=key(r['역사명']||r['역명(한글)']);
      const en=clean(r['영문역사명']||r['역명(영어)']);
      if(!ko||!en||en==='없음') continue;
      const ln=lineName(r['노선명']||r['운영노선']);
      const lat=r['역위도']??r['역위치(위도)'],lon=r['역경도']??r['역위치(경도)'];
      const city=cityFor(m.title,clean(r['역사도로명주소']||r['역주소(도로명주소)']),Number(lat),Number(lon));
      const point=coords(lat,lon,city);
      if(!point){issues.push({source:m.id,row:n+1,name:ko,reason:'missing_or_invalid_coordinates'});continue;}
      if(/의정부/.test(m.title) && point.latitude<37.6) {issues.push({source:m.id,row:n+1,name:ko,reason:'outside_operator_area'});continue;}
      const source_date=date(r['데이터기준일자'],date(m.filename.match(/20\d{6}/)?.[0], ''));
      if(!source_date || source_date>'2026-10-19') {issues.push({source:m.id,row:n+1,name:ko,reason:'missing_or_future_date'});continue;}
      rows.push({name_ko:ko+'역',name_en:en.replace(/\s*station$/i,'').trim()+' Station',city,line:ln,...point,source_date,source_url:m.source_url,source_id:m.id});
    }
  }
}
// Daegu's current history file has malformed DMS values for some rows. Use the
// dedicated official decimal coordinate file, joined by exact normalized name.
const dw=xlsx.readFile(`${root}/data/rail/213.xlsx`);
const daegu=xlsx.utils.sheet_to_json(dw.Sheets[dw.SheetNames[0]]);
const std=xlsx.readFile(`${root}/data/rail/35.xlsx`);
const da=xlsx.utils.sheet_to_json(std.Sheets[std.SheetNames[0]],{header:1});
for(const d of daegu) {
  const r=da.slice(2).find(r=>key(r[1])===key(d['역명']));
  if(!r)continue;
  const point=coords(d['위도'],d['경도'],'Daegu'); if(!point)continue;
  rows.push({name_ko:key(d['역명'])+'역',name_en:clean(r[4]).replace(/\s*station$/i,'')+' Station',city:'Daegu',line:lineName(d['노선명']),...point,source_date:'2026-02-05',source_url:'https://data.kric.go.kr/rips/M_01_01/detail.do?id=213',source_id:'213'});
}
// Retain the existing URLs and measured line coordinates for the original pages.
const unique=new Map();
for(const r of rows.sort((a,b)=>b.source_date.localeCompare(a.source_date))) {
  const k=[r.city,key(r.name_ko),r.line].join('|');
  if(!unique.has(k)) unique.set(k,r);
}
const groups=new Map();
for(const r of unique.values()) {
  // Same name in different cities remains separate. Far-apart names are not interchanges.
  const k=[r.city,key(r.name_ko)].join('|');
  const candidates=groups.get(k)||[];
  let g=candidates.find(g=>Math.abs(g.stations[0].latitude-r.latitude)<0.012&&Math.abs(g.stations[0].longitude-r.longitude)<0.012);
  if(!g){g={slug:'station-'+crypto.createHash('sha256').update(k+`|${candidates.length}`).digest('hex').slice(0,14),name_ko:r.name_ko,name_en:r.name_en,city:r.city,stations:[],source_url:r.source_url,source_date:r.source_date};candidates.push(g);groups.set(k,candidates);}
  g.stations.push({...r,id:'kric-'+crypto.createHash('sha256').update([r.city,key(r.name_ko),r.line].join('|')).digest('hex').slice(0,18)});
}
let pages=[...groups.values()].flat();
for(const [ko,slug] of Object.entries({'서울':'seoul-station','강남':'gangnam-station','잠실':'jamsil-station'})) {
  const g=pages.find(g=>key(g.name_ko)===ko&&g.city==='Seoul · Incheon · Gyeonggi');
  if(g)g.slug=slug;
}
// Mainline source is separate: historical descriptions are not a live timetable.
const csv=new TextDecoder('euc-kr').decode(fs.readFileSync(`${root}/data/rail/mainline.zip`));
const mw=xlsx.read(csv,{type:'string'});
const regionNames={'서울':'Seoul','부산':'Busan','대구':'Daegu','대전':'Daejeon','광주':'Gwangju','울산':'Ulsan','인천':'Incheon','경기':'Gyeonggi','강원':'Gangwon','충북':'Chungbuk','충청북':'Chungbuk','충남':'Chungnam','충청남':'Chungnam','전북':'Jeonbuk','전라북':'Jeonbuk','전남':'Jeonnam','전라남':'Jeonnam','경북':'Gyeongbuk','경상북':'Gyeongbuk','경남':'Gyeongnam','경상남':'Gyeongnam'};
for(const r of xlsx.utils.sheet_to_json(mw.Sheets[mw.SheetNames[0]])) {
  if(!clean(r['취급업무']).includes('여객')||/폐역이다|폐지된 역|폐역된/.test(clean(r['역소개'])))continue;
  const point=coords(r['위도좌표'],r['경도좌표'],''); if(!point)continue;
  const city=Object.entries(regionNames).sort((a,b)=>b[0].length-a[0].length).find(([ko])=>clean(r['주소']).startsWith(ko))?.[1];
  if(!city||!r['역이름_영어'])continue;
  const slug='rail-'+crypto.createHash('sha256').update(clean(r['역이름'])+'|'+clean(r['주소'])).digest('hex').slice(0,14);
  const source_url='https://www.data.go.kr/data/15067652/fileData.do',source_date='2025-07-11';
  pages.push({slug,name_ko:clean(r['역이름']),name_en:clean(r['역이름_영어']),city,source_url,source_date,stations:[{id:slug,name_ko:clean(r['역이름']),line:'Regional rail',...point,source_url,source_date}]});
}
pages.sort((a,b)=>a.city.localeCompare(b.city)||a.name_en.localeCompare(b.name_en));
fs.writeFileSync(`${root}/lib/stations.json`,JSON.stringify(pages,null,2)+'\n');
const rail=pages.flatMap(p=>p.stations.map(s=>({...s,source_url:s.source_url||p.source_url})));
let sql='BEGIN;\n';
for(let i=0;i<rail.length;i+=150)sql+=`INSERT INTO public.rail_stations (id,name_ko,line,latitude,longitude,source_date,source_url) SELECT id,name_ko,line,latitude,longitude,source_date,source_url FROM jsonb_to_recordset($rail$${JSON.stringify(rail.slice(i,i+150))}$rail$::jsonb) AS r(id text,name_ko text,line text,latitude float8,longitude float8,source_date date,source_url text) ON CONFLICT(id) DO UPDATE SET name_ko=excluded.name_ko,line=excluded.line,latitude=excluded.latitude,longitude=excluded.longitude,source_date=excluded.source_date,source_url=excluded.source_url;\n`;
sql+='COMMIT;\n';
fs.writeFileSync(`${root}/data/rail/import.sql`,sql);
fs.writeFileSync(`${root}/data/rail/issues.json`,JSON.stringify(issues,null,2));
console.log(JSON.stringify({pages:pages.length,coordinates:rail.length,regions:[...new Set(pages.map(p=>p.city))],excluded:issues.length}));
