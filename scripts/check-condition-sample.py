"""Read-only HIRA pilot. Never log credentials or authenticated URLs."""
import argparse,collections,datetime,json,os,time,urllib.parse,urllib.request,xml.etree.ElementTree as ET
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--manifest',required=True);p.add_argument('--output',required=True);p.add_argument('--limit',type=int,default=40);a=p.parse_args()
root=Path(__file__).resolve().parents[1]
key=os.environ.get('HIRA_SERVICE_KEY','')
if not key:
 for line in (root/'.env.local').read_text(encoding='utf-8-sig').splitlines():
  if line.startswith('HIRA_SERVICE_KEY='):key=line.split('=',1)[1].strip()
if not key:raise SystemExit('HIRA_SERVICE_KEY is required')
manifest=json.loads(Path(a.manifest).read_text(encoding='utf8'))
results=[];today=datetime.date.today().isoformat()
for clinic in manifest['sample'][:a.limit]:
 result={**clinic,'checked_at':today}
 params=urllib.parse.urlencode({'ServiceKey':urllib.parse.unquote(key),'numOfRows':'1','pageNo':'1','ykiho':clinic['ykiho']})
 try:
  request=urllib.request.Request('https://apis.data.go.kr/B551182/hospDiagInfoService1/getClinicTop5List1?'+params)
  with urllib.request.urlopen(request,timeout=20) as response:raw=response.read(1024*1024)
  xml=ET.fromstring(raw)
  for e in xml.iter():e.tag=e.tag.split('}')[-1]
  get=lambda field:xml.findtext('.//'+field,'').strip()
  code=get('resultCode') or get('returnReasonCode')
  result.update(api_status='api_error',result_code=code)
  if code=='00':
   item=xml.find('.//item')
   if item is None:result['api_status']='no_record'
   else:
    fields={e.tag:(e.text or '').strip() for e in item}
    result['response']=fields
    names=[fields.get('mfrnIntrsIlnsCdNm'+str(i),fields.get('mfrnIntrsIlnsNm'+str(i),'')) for i in range(1,6)]
    match=fields.get('ykiho')==clinic['ykiho']
    result['identity_match']=match
    result['name_match']=''.join(fields.get('yadmNm','').split())==''.join(clinic['name_ko'].split())
    result['api_status']='verified' if match and result['name_match'] and fields.get('crtrYm') and any(names) else 'needs_review'
    if result['api_status']=='verified':result['record']={'ykiho':clinic['ykiho'],'clinicName':fields['yadmNm'],'referenceMonth':fields['crtrYm'],'checkedAt':today,'conditions':[n for n in names if n],'verified':True}
 except Exception as error:result['api_status']='request_failed';result['error_type']=type(error).__name__
 results.append(result)
 Path(a.output).write_text(json.dumps({'checked_at':today,'results':results,'summary':dict(collections.Counter(r['api_status'] for r in results))},ensure_ascii=False,indent=2),encoding='utf8')
 print(json.dumps({'completed':len(results),'status':result['api_status'],'code':result.get('result_code','')},ensure_ascii=False),flush=True)
 # Stop on credential/access errors rather than consuming the entire sample quota.
 if result.get('result_code') in ['20','21','30','31']:break
 time.sleep(.3)
