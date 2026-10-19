"""Prepare the 2026-06 HIRA snapshot without guessing departments from priority."""
import collections, hashlib, json
from pathlib import Path
import openpyxl

ROOT=Path(__file__).resolve().parents[1]
def read(pattern):
    file=next((ROOT/'data/hira').rglob(pattern))
    ws=openpyxl.load_workbook(file,read_only=True,data_only=True).active
    values=iter(ws.values); headers=next(values)
    for values in values: yield dict(zip(headers,values))

NAMES={
 '00':('general-medicine','General Medicine'),'01':('internal-medicine','Internal Medicine'),
 '02':('neurology','Neurology'),'03':('psychiatry','Psychiatry'),'04':('surgery','General Surgery'),
 '05':('orthopedics','Orthopedics'),'06':('neurosurgery','Neurosurgery'),
 '07':('thoracic-surgery','Thoracic Surgery'),'08':('plastic-surgery','Plastic Surgery'),
 '09':('anesthesiology','Anesthesiology & Pain Medicine'),'10':('ob-gyn','Obstetrics & Gynecology'),
 '11':('pediatrics','Pediatrics'),'12':('ophthalmology','Ophthalmology'),'13':('ent','ENT'),
 '14':('dermatology','Dermatology'),'15':('urology','Urology'),'16':('radiology','Radiology'),
 '17':('radiation-oncology','Radiation Oncology'),'18':('pathology','Pathology'),
 '19':('laboratory-medicine','Laboratory Medicine'),'20':('tuberculosis','Tuberculosis Medicine'),
 '21':('rehabilitation','Rehabilitation Medicine'),'22':('nuclear-medicine','Nuclear Medicine'),
 '23':('family-medicine','Family Medicine'),'24':('emergency-medicine','Emergency Medicine'),
 '25':('occupational-medicine','Occupational Medicine'),'26':('preventive-medicine','Preventive Medicine'),
}
TARGET={'01','08','14','15',*[str(i) for i in range(49,62)]}
details=collections.defaultdict(dict); labels={}
for r in read('*03_*.xlsx'):
    key=r['암호화요양기호']; code=str(r['진료과목코드']).zfill(2)
    if code not in NAMES:
        if 49<=int(code)<=61: NAMES[code]=('dentistry','Dentistry')
        elif int(code)>=80: NAMES[code]=('korean-medicine','Korean Medicine')
        else: NAMES[code]=('department-'+code,r['진료과목코드명'])
    labels[code]=r['진료과목코드명']
    count=int(r['과목별 전문의수'] or 0)
    details[key][code]=max(count,details[key].get(code,0))

output=[]
for r in read('1.*.xlsx'):
    key=r['암호화요양기호']; deps=details.get(key,{})
    if not TARGET.intersection(deps): continue
    # The base record supplies institution type; departments remain a separate list.
    output.append([hashlib.md5(key.encode()).hexdigest(),r['요양기관명'],r['종별코드명'],[[c,n] for c,n in deps.items()]])
assert len({r[0] for r in output})==len(output)
catalog=[dict(code=code,name_ko=labels[code],slug=NAMES[code][0],name_en=NAMES[code][1]) for code in sorted(labels)]
(ROOT/'data/department-catalog.json').write_text(json.dumps(catalog,ensure_ascii=False),encoding='utf8')
setup=(ROOT/'db/registry-departments.sql').read_text(encoding='utf8')
setup+="\nINSERT INTO hira_department_catalog SELECT code,name_ko,slug,name_en FROM jsonb_to_recordset($catalog$"+json.dumps(catalog,ensure_ascii=False)+"$catalog$::jsonb) r(code text,name_ko text,slug text,name_en text) ON CONFLICT(code) DO UPDATE SET name_ko=excluded.name_ko,slug=excluded.slug,name_en=excluded.name_en;"
(ROOT/'data/setup-departments.sql').write_text(setup,encoding='utf8')
frontend_labels={x['slug']:x['name_en'] for x in catalog}
frontend_labels.update({'medical-clinic':'Multi-specialty Clinic','general-hospital':'General Hospital','long-term-care':'Long-term Care Hospital'})
(ROOT/'lib/department-labels.json').write_text(json.dumps(frontend_labels,ensure_ascii=False,indent=2),encoding='utf8')
folder=ROOT/'data/department-batches';folder.mkdir(exist_ok=True)
for i in range(0,len(output),2500):
    chunk=json.dumps(output[i:i+2500],ensure_ascii=False,separators=(',',':'))
    sql="INSERT INTO hira_department_stage_202606(hira_hash,name_ko,institution_type,subjects) SELECT r->>0,r->>1,r->>2,r->3 FROM jsonb_array_elements($batch$"+chunk+"$batch$::jsonb) r ON CONFLICT(hira_hash) DO UPDATE SET subjects=excluded.subjects,name_ko=excluded.name_ko,institution_type=excluded.institution_type;"
    (folder/f'{i//2500:03}.sql').write_text(sql,encoding='utf8')
print(json.dumps(dict(clinics=len(output),department_codes=len(catalog),batches=(len(output)+2499)//2500)))
