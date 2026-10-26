"""Read-only, deterministic 40-clinic pilot from the official June 2026 files.
The output is a selection manifest, never a successful API-validation report.
"""
import argparse, hashlib, json
from pathlib import Path
import openpyxl

root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--output',required=True)
args=parser.parse_args()
def rows(pattern):
    file=next((root/'data/hira').rglob(pattern))
    sheet=openpyxl.load_workbook(file,read_only=True,data_only=True).active
    values=iter(sheet.values);headers=next(values)
    for row in values:yield dict(zip(headers,row))
subjects={}
for row in rows('*03_*.xlsx'):
    key=row['암호화요양기호'];subjects.setdefault(key,set()).add(str(row['진료과목코드']).zfill(2))
groups={'gangnam_area':[],'jamsil_area':[]}
for row in rows('1.*.xlsx'):
    if str(row['종별코드'])!='31':continue
    address=str(row.get('주소') or '')
    group='gangnam_area' if address.startswith(('서울특별시 강남구 ','서울특별시 서초구 ')) else 'jamsil_area' if address.startswith('서울특별시 송파구 ') and any(dong in address for dong in ['(잠실동','(신천동']) else None
    if not group:continue
    key=row['암호화요양기호']
    # Use an existing supported target department to sample profiles in our directory.
    deps=subjects.get(key,set())
    if not deps.intersection({'01','08','14','15'}):continue
    groups[group].append({'ykiho':key,'name_ko':row['요양기관명'],'address_ko':address,'institution_code':'31','department_codes':sorted(deps),'urology_reported':'15' in deps,'stable_order':hashlib.sha256(key.encode()).hexdigest(),'api_status':'not_requested'})
selected=[]
for group,candidates in groups.items():
    ordered=sorted(candidates,key=lambda r:r['stable_order'])
    priority=[r for r in ordered if r['urology_reported']][:10]
    chosen=priority+[r for r in ordered if r not in priority][:20-len(priority)]
    assert len(chosen)==20
    selected.extend(dict(r,group=group) for r in chosen)
assert len({r['ykiho'] for r in selected})==40
result={'source_snapshot':'2026-06','selection':'20 Gangnam-gu/Seocho-gu + 20 Jamsil-dong/Sincheon-dong; up to 10 reported-urology profiles per group, then deterministic SHA256 order; not a representative prevalence sample','api_validation_complete':False,'candidate_counts':{g:len(r) for g,r in groups.items()},'sample':selected}
Path(args.output).write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'selected':len(selected),'groups':{g:sum(r['group']==g for r in selected) for g in groups},'urology':sum(r['urology_reported'] for r in selected),'candidate_counts':result['candidate_counts'],'api_validation_complete':False}))
