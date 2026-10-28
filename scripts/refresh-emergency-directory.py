"""Validate and replace only the NMC public institution snapshot; never log credentials."""
import argparse,datetime,json,math,os,urllib.parse,urllib.request,xml.etree.ElementTree as ET
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--input',help='Previously retrieved official baseline JSON');a=p.parse_args()
if a.input:
 data=json.loads(Path(a.input).read_text(encoding='utf-8'));rows=data['items'];checked=data['summary']['checkedAt'];total=data['summary']['total']
 assert data['summary']['complete'] is True
else:
 key=os.environ.get('NMC_SERVICE_KEY','')
 if not key:
  for line in (root/'.env.local').read_text(encoding='utf-8-sig').splitlines():
   if line.startswith('NMC_SERVICE_KEY='):key=line.split('=',1)[1].strip()
 if not key:raise SystemExit('NMC_SERVICE_KEY required; previous snapshot retained')
 try:
  params=urllib.parse.urlencode({'serviceKey':urllib.parse.unquote(key),'pageNo':1,'numOfRows':1000})
  with urllib.request.urlopen('https://apis.data.go.kr/B552657/ErmctInfoInqireService/getEgytListInfoInqire?'+params,timeout=25) as r:raw=r.read(4*1024*1024)
  xml=ET.fromstring(raw)
  for n in xml.iter():n.tag=n.tag.split('}')[-1]
  assert xml.findtext('.//resultCode')=='00'
  rows=[{n.tag:(n.text or '') for n in row} for row in xml.findall('.//item')];total=int(xml.findtext('.//totalCount','0'));checked=datetime.datetime.now(datetime.timezone.utc).isoformat()
 except Exception as e:raise SystemExit(type(e).__name__+': official fetch failed; previous snapshot retained') from None
provinces=json.loads((root/'lib/national-areas.json').read_text(encoding='utf-8'))['provinces']
classes={'G001':'권역응급의료센터','G006':'지역응급의료센터','G007':'지역응급의료기관','G009':'응급실운영신고기관'}
records=[]
assert 0<total==len(rows)<=1000,'Incomplete response; previous snapshot retained'
for r in rows:
 for field in ['hpid','dutyName','dutyAddr','dutyTel3','wgs84Lat','wgs84Lon']:assert r.get(field),'Missing required public field'
 assert classes.get(r['dutyEmcls'])==r.get('dutyEmclsName'),'Unknown institution class'
 lat=float(r['wgs84Lat']);lon=float(r['wgs84Lon']);assert math.isfinite(lat) and math.isfinite(lon) and 32<=lat<=40 and 123<=lon<=133
 matches=[p for p in provinces if any(r['dutyAddr'].startswith(prefix) for prefix in p['prefixes'])];assert len(matches)==1,'Unmapped province'
 records.append({'id':r['hpid'],'nameKo':r['dutyName'],'addressKo':r['dutyAddr'],'region':matches[0]['slug'],'district':r['dutyAddr'].split()[1] if matches[0]['slug']!='sejong' else '세종시','classCode':r['dutyEmcls'],'classKo':r['dutyEmclsName'],'emergencyPhone':r['dutyTel3'],'mainPhone':r.get('dutyTel1',''),'latitude':lat,'longitude':lon})
assert len({r['id'] for r in records})==total,'Duplicate institution ID'
output={'source':'https://www.data.go.kr/data/15000563/openapi.do','checkedAt':checked,'records':sorted(records,key=lambda r:r['id'])}
target=root/'lib/emergency-directory.json'
if target.exists():
 old=json.loads(target.read_text(encoding='utf-8'))
 assert total>=len(old['records'])*0.9,'Large count decrease requires review; previous snapshot retained'
temporary=target.with_suffix('.json.tmp');temporary.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temporary.replace(target)
print(json.dumps({'records':total,'regions':len({r['region'] for r in records}),'checkedAt':checked}))
