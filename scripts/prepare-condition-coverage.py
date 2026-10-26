"""Enumerate the complete reporting-urology cohort in two fixed source geographies.
No network or production writes. Uses the official June 2026 provider snapshot.
"""
import argparse,json
from pathlib import Path
import openpyxl
root=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--output',required=True);a=p.parse_args()
def rows(pattern):
 sheet=openpyxl.load_workbook(next((root/'data/hira').rglob(pattern)),read_only=True,data_only=True).active
 values=iter(sheet.values);headers=next(values)
 for row in values:yield dict(zip(headers,row))
subjects={}
for row in rows('*03_*.xlsx'):
 subjects.setdefault(row['암호화요양기호'],set()).add(str(row['진료과목코드']).zfill(2))
selected=[]
for row in rows('1.*.xlsx'):
 if str(row['종별코드'])!='31':continue
 key=row['암호화요양기호'];deps=subjects.get(key,set())
 if '15' not in deps:continue
 address=str(row.get('주소') or '')
 group='gangnam' if address.startswith(('서울특별시 강남구 ','서울특별시 서초구 ')) else 'jamsil' if address.startswith('서울특별시 송파구 ') and any(dong in address for dong in ['(잠실동','(신천동']) else None
 if group:selected.append({'ykiho':key,'name_ko':row['요양기관명'],'address_ko':address,'institution_code':'31','department_codes':sorted(deps),'urology_reported':True,'group':group})
selected.sort(key=lambda r:(r['group'],r['ykiho']))
assert len(selected)==len({r['ykiho'] for r in selected})
result={'source_snapshot':'2026-06','selection':'All type-31 clinics reporting department 15 in Gangnam-gu/Seocho-gu or Jamsil-dong/Sincheon-dong in the official June 2026 snapshot. This is a fixed directory cohort, not all current providers or a disease prevalence survey.','sample':selected}
Path(a.output).write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'selected':len(selected),'gangnam':sum(r['group']=='gangnam' for r in selected),'jamsil':sum(r['group']=='jamsil' for r in selected)}))
