"""Build public evidence files from completed read-only verification, retaining pilot history."""
import argparse,collections,datetime,json,re
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--manifest',required=True);p.add_argument('--results',required=True);a=p.parse_args()
root=Path(__file__).resolve().parents[1]
load=lambda path:json.loads(Path(path).read_text(encoding='utf-8-sig'))
manifest=load(a.manifest);result=load(a.results);rows=result['results'];selected={r['ykiho']:r for r in manifest['sample']}
assert len(rows)==len(selected)==len({r['ykiho'] for r in rows}), 'Verification must cover every selected identity'
snapshot=load(root/'lib/hira-condition-pilot.json');scopes=load(root/'lib/condition-scopes.json')
for scope in scopes.values():scope['comparisonEligible']=False
months=collections.Counter()
for row in rows:
 key=row['ykiho'];candidate=selected[key]
 assert row['group']==candidate['group'] and row['address_ko']==candidate['address_ko']
 eligible=row['api_status']=='verified'
 scopes[key]={'area':row['group'],'address':row['address_ko'],'comparisonEligible':eligible}
 if not eligible:continue
 record=row['record'];assert record['ykiho']==key and record['verified'] is True and row['identity_match'] and row['name_match']
 assert re.fullmatch(r'20\d{2}(0[1-9]|1[0-2])',record['referenceMonth'])
 datetime.date.fromisoformat(record['checkedAt']);assert 1<=len(record['conditions'])<=5 and all(isinstance(c,str) and c.strip() for c in record['conditions'])
 snapshot[key]=record;months[record['referenceMonth']]+=1
coverage={'checkedAt':result['checked_at'],'directorySnapshot':'2026-06','selection':manifest['selection'],'selected':len(rows),'summary':dict(collections.Counter(r['api_status'] for r in rows)),'referenceMonths':sorted(months),'areas':{area:{'selected':sum(r['group']==area for r in rows),**dict(collections.Counter(r['api_status'] for r in rows if r['group']==area))} for area in ['gangnam','jamsil']},'preservedPilotRecordsOutsideCohort':sum(not scopes[k].get('comparisonEligible',False) for k in snapshot),'notes':['Reporting urology is not a specialist qualification.','No-record is not evidence that a condition is not treated.','Name mismatches and unverified records are excluded from condition comparisons.','Existing pilot profile records outside the expanded cohort are retained but do not enter the new comparisons.']}
for name,data in [('lib/hira-condition-pilot.json',snapshot),('lib/condition-scopes.json',scopes),('lib/condition-coverage.json',coverage)]:
 (root/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'publicRecords':len(snapshot),'coverage':coverage},ensure_ascii=True))
