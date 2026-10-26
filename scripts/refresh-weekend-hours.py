"""Read-only regional NMC refresh; stages a candidate and delta, never publishes.
Run with --date YYYY-MM-DD. A failed/partial fetch cannot produce a candidate.
"""
import argparse,collections,datetime,json,re,urllib.parse,urllib.request,xml.etree.ElementTree as ET
from pathlib import Path
import openpyxl
p=argparse.ArgumentParser();p.add_argument('--date',default=datetime.date.today().isoformat());a=p.parse_args()
if datetime.date.fromisoformat(a.date).isoformat()!=a.date:raise SystemExit('Use YYYY-MM-DD')
root=Path(__file__).resolve().parents[1];out=root/'data/nmc'/a.date;out.mkdir(parents=True,exist_ok=True)
key=next(l.split('=',1)[1].strip() for l in (root/'.env.local').read_text(encoding='utf-8-sig').splitlines() if l.startswith('HIRA_SERVICE_KEY='))
def norm(v):return re.sub(r'[^가-힣a-zA-Z0-9]','',str(v or ''))
def road(v):return norm(str(v).split(',')[0].split('(')[0])
def hours(d,n):
 s=d.get(f'dutyTime{n}s','');e=d.get(f'dutyTime{n}c','')
 valid=lambda v:bool(re.fullmatch(r'\d{4}',v)) and int(v[:2])<24 and int(v[2:])<60
 if not s and not e:return {'status':'not_reported'}
 if not valid(s) or not valid(e) or s>=e:return {'status':'needs_review'}
 return {'status':'reported_schedule','start':s[:2]+':'+s[2:],'end':e[:2]+':'+e[2:]}
all_items=[];calls=0
for district in ['강남구','서초구','송파구']:
 items=[];expected=None
 for page in range(1,31):
  cache=out/f'{district}-{page}.json'
  if cache.exists():payload=json.loads(cache.read_text(encoding='utf8'))
  else:
   try:
    params=urllib.parse.urlencode({'serviceKey':urllib.parse.unquote(key),'Q0':'서울특별시','Q1':district,'pageNo':page,'numOfRows':500})
    with urllib.request.urlopen('https://apis.data.go.kr/B552657/HsptlAsembySearchService/getHsptlMdcncListInfoInqire?'+params,timeout=30) as r:t=ET.fromstring(r.read(8*1024*1024))
    calls+=1
    for e in t.iter():e.tag=e.tag.split('}')[-1]
    if t.findtext('.//resultCode')!='00':raise ValueError('API unsuccessful')
    payload={'total':int(t.findtext('.//totalCount')),'items':[{e.tag:(e.text or '').strip() for e in i} for i in t.findall('.//item')]}
    cache.write_text(json.dumps(payload,ensure_ascii=False),encoding='utf8')
   except Exception as e:raise SystemExit('Refresh stopped; no candidate published. '+type(e).__name__)
  if expected is None:expected=payload['total']
  if expected!=payload['total']:raise SystemExit('Count changed during pagination; review fetch')
  items+=payload['items']
  if len(items)>=expected:break
  if not payload['items']:raise SystemExit('Incomplete source pages')
 if len(items)!=expected or len({i['hpid'] for i in items})!=expected:raise SystemExit('Incomplete/duplicate source pages')
 all_items+=items
 print(json.dumps({'district':district,'records':len(items),'calls':calls},ensure_ascii=False),flush=True)
index=collections.defaultdict(list)
for item in all_items:index[(norm(item.get('dutyName')),road(item.get('dutyAddr')))].append(item)
sheet=openpyxl.load_workbook(next((root/'data/hira').rglob('1.*.xlsx')),read_only=True,data_only=True).active
it=iter(sheet.values);headers=next(it);candidate={};review=[];selected=0
for values in it:
 r=dict(zip(headers,values));addr=str(r.get('주소') or '')
 if str(r.get('종별코드'))!='31':continue
 if not (addr.startswith(('서울특별시 강남구 ','서울특별시 서초구 ')) or addr.startswith('서울특별시 송파구 ') and any(d in addr for d in ['(잠실동','(신천동'])):continue
 selected+=1;matches=index[(norm(r['요양기관명']),road(addr))];tel=norm(r.get('전화번호'))
 if len(matches)!=1 or not tel or norm(matches[0].get('dutyTel1'))!=tel:
  review.append({'id':r['암호화요양기호'],'name':r['요양기관명'],'reason':'unmatched' if not matches else 'ambiguous' if len(matches)>1 else 'phone_mismatch'});continue
 d=matches[0];candidate[r['암호화요양기호']]={'name':r['요양기관명'],'address':addr,'telephone':d['dutyTel1'],'checkedAt':a.date,'saturday':hours(d,6),'sunday':hours(d,7)}
old=json.loads((root/'lib/weekend-hours-pilot.json').read_text(encoding='utf8'))
changed=[k for k in candidate.keys()&old.keys() if any(candidate[k][f]!=old[k][f] for f in ['name','address','telephone','saturday','sunday'])]
report={'checkedAt':a.date,'source':'https://www.data.go.kr/data/15000736/openapi.do','sourceSnapshot':'HIRA 2026-06','selected':selected,'matched':len(candidate),'review':dict(collections.Counter(r['reason'] for r in review)),'saturday':dict(collections.Counter(r['saturday']['status'] for r in candidate.values())),'sunday':dict(collections.Counter(r['sunday']['status'] for r in candidate.values())),'added':len(candidate.keys()-old.keys()),'removed':list(old.keys()-candidate.keys()),'changed':changed,'calls':calls}
(out/'candidate.json').write_text(json.dumps(candidate,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
(out/'review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=False),flush=True)
