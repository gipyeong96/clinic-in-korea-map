"""Build a repeatable SQL import from unmodified official CSV downloads (CP949)."""
import csv, json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
def rows(name):
    return list(csv.DictReader((root / 'data' / name).read_text(encoding='cp949').splitlines()))
registry = rows('registry.csv')
stations = rows('stations.csv')
assert len(registry) == 6921 and len(stations) == 276
medical = [dict(source_row=int(r['번호']), name_ko=r['상호명'], status=r['상태'],
                institution_type=r['기관구분'], region=r['지역'])
           for r in registry if r['기관구분'] != '유치사업자']
rail = [dict(id='seoulmetro-' + r['호선'] + '-' + r['고유역번호(외부역코드)'],
             name_ko=r['역명'], line=r['호선'], latitude=float(r['위도']), longitude=float(r['경도']),
             source_date=r['작성기준일']) for r in stations]
sql = 'BEGIN;\n' + (root/'db/official-data.sql').read_text(encoding='utf-8')
sql += "\nINSERT INTO foreign_patient_registry (source_date,source_row,name_ko,status,institution_type,region,source_url)\nSELECT '2026-07-21', source_row,name_ko,status,institution_type,region,'https://www.data.go.kr/data/3050000/fileData.do'\nFROM jsonb_to_recordset($registry$" + json.dumps(medical,ensure_ascii=False) + "$registry$::jsonb) AS r(source_row int,name_ko text,status text,institution_type text,region text)\nON CONFLICT(source_date,source_row) DO UPDATE SET status=excluded.status,name_ko=excluded.name_ko,institution_type=excluded.institution_type,region=excluded.region;\n"
sql += "INSERT INTO rail_stations SELECT id,name_ko,line,latitude,longitude,source_date,'https://www.data.go.kr/data/15099316/fileData.do' FROM jsonb_to_recordset($rail$" + json.dumps(rail,ensure_ascii=False) + "$rail$::jsonb) AS r(id text,name_ko text,line text,latitude float8,longitude float8,source_date date) ON CONFLICT(id) DO UPDATE SET latitude=excluded.latitude,longitude=excluded.longitude,source_date=excluded.source_date;\n"
# Candidate matches are kept separate. The source lacks addresses/registration IDs;
# do not mark a clinic confirmed based only on a similar name and broad region.
sql += """
CREATE TABLE IF NOT EXISTS registry_match_candidates (
  clinic_id uuid NOT NULL REFERENCES clinics(id), source_date date NOT NULL,
  source_row int NOT NULL, match_method text NOT NULL,
  PRIMARY KEY(clinic_id,source_date,source_row)
);
ALTER TABLE registry_match_candidates ENABLE ROW LEVEL SECURITY;
INSERT INTO registry_match_candidates
SELECT c.id,r.source_date,r.source_row,'exact_name_and_province_needs_review'
FROM clinics c JOIN foreign_patient_registry r ON c.name_ko=r.name_ko
WHERE r.source_date='2026-07-21' AND r.status='유지'
 AND left(c.address_ko,2)=r.region
ON CONFLICT DO NOTHING;
COMMIT;
SELECT (SELECT count(*) FROM foreign_patient_registry) medical_registry_rows,
       (SELECT count(*) FROM rail_stations) official_station_rows,
       (SELECT count(*) FROM registry_match_candidates) review_candidates;
"""
(root/'data/import-official.sql').write_text(sql,encoding='utf-8')
# Curated first station pages use the downloaded official coordinates, not estimates.
names = {'서울':'seoul-station','강남':'gangnam-station','잠실':'jamsil-station'}
selected = []
for ko,slug in names.items():
    entries=[r for r in rail if r['name_ko']==ko]
    selected.append(dict(slug=slug,name_ko=ko+'역',name_en={'서울':'Seoul Station','강남':'Gangnam Station','잠실':'Jamsil Station'}[ko],
                         stations=entries,source_url='https://www.data.go.kr/data/15099316/fileData.do',source_date='2025-08-14'))
(root/'lib/stations.json').write_text(json.dumps(selected,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(dict(medical_rows=len(medical),excluded_agents=len(registry)-len(medical),stations=len(rail),sql_bytes=len(sql.encode()))))
