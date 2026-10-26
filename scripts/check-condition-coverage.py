"""Read-only official API verification with resume, bounded retries and no secret logging."""
import argparse,collections,datetime,json,os,time,urllib.parse,urllib.request,xml.etree.ElementTree as ET
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--manifest',required=True);p.add_argument('--output',required=True);p.add_argument('--reuse');a=p.parse_args()
root=Path(__file__).resolve().parents[1];key=os.environ.get('HIRA_SERVICE_KEY','')
if not key:
 for line in (root/'.env.local').read_text(encoding='utf-8-sig').splitlines():
  if line.startswith('HIRA_SERVICE_KEY='):key=line.split('=',1)[1].strip()
if not key:raise SystemExit('HIRA_SERVICE_KEY is required')
today=datetime.date.today().isoformat();manifest=json.loads(Path(a.manifest).read_text(encoding='utf8'));old={}
for path in [a.reuse,a.output]:
 if path and Path(path).exists():
  for r in json.loads(Path(path).read_text(encoding='utf8'))['results']:
   if r.get('checked_at')==today and r['api_status'] in ['verified','no_record']:old[r['ykiho']]=r
results=[];calls=0
for clinic in manifest['sample']:
 prior=old.get(clinic['ykiho']);result={**clinic,'checked_at':today}
 if prior and prior['name_ko']==clinic['name_ko'] and prior['address_ko']==clinic['address_ko']:
  result={**prior,**clinic,'reused_same_day':True}
 else:
  for attempt in range(3):
   try:
    params=urllib.parse.urlencode({'ServiceKey':urllib.parse.unquote(key),'numOfRows':'1','pageNo':'1','ykiho':clinic['ykiho']})
    with urllib.request.urlopen('https://apis.data.go.kr/B551182/hospDiagInfoService1/getClinicTop5List1?'+params,timeout=20) as response:raw=response.read(1024*1024)
    calls+=1;xml=ET.fromstring(raw)
    for e in xml.iter():e.tag=e.tag.split('}')[-1]
    code=xml.findtext('.//resultCode','').strip() or xml.findtext('.//returnReasonCode','').strip();result.update(api_status='api_error',result_code=code)
    if code=='00':
     item=xml.find('.//item')
     if item is None:result['api_status']='no_record'
     else:
      f={e.tag:(e.text or '').strip() for e in item};names=[f.get('mfrnIntrsIlnsCdNm'+str(i),f.get('mfrnIntrsIlnsNm'+str(i),'')) for i in range(1,6)]
      result.update(identity_match=f.get('ykiho')==clinic['ykiho'],name_match=''.join(f.get('yadmNm','').split())==''.join(clinic['name_ko'].split()))
      result['api_status']='verified' if result['identity_match'] and result['name_match'] and f.get('crtrYm') and any(names) else 'needs_review'
      if result['api_status']=='verified':result['record']={'ykiho':clinic['ykiho'],'clinicName':f['yadmNm'],'referenceMonth':f['crtrYm'],'checkedAt':today,'conditions':[n for n in names if n],'verified':True}
    if result['api_status'] in ['verified','no_record','needs_review'] or code in ['20','21','30','31']:break
   except Exception as error:result.update(api_status='request_failed',error_type=type(error).__name__)
   time.sleep(1)
 results.append(result)
 Path(a.output).write_text(json.dumps({'checked_at':today,'selection':manifest['selection'],'results':results,'summary':dict(collections.Counter(r['api_status'] for r in results))},ensure_ascii=False,indent=2),encoding='utf8')
 if len(results)%10==0 or len(results)==len(manifest['sample']):print(json.dumps({'completed':len(results),'total':len(manifest['sample']),'calls_this_run':calls,'summary':dict(collections.Counter(r['api_status'] for r in results))}),flush=True)
 if result.get('result_code') in ['20','21','30','31']:break
 time.sleep(.2)
