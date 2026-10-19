BEGIN;
SELECT setval(pg_get_serial_sequence('public.categories','id'),greatest((SELECT max(id) FROM categories),1));
INSERT INTO categories(slug,name_ko,name_en,name_mn)
SELECT slug,CASE WHEN slug='dentistry' THEN '치과' WHEN slug='korean-medicine' THEN '한방' ELSE min(name_ko) END,min(name_en),min(name_en)
FROM hira_department_catalog GROUP BY slug ON CONFLICT(slug) DO NOTHING;
INSERT INTO categories(slug,name_ko,name_en,name_mn) VALUES
 ('medical-clinic','복수 진료과목','Multi-specialty Clinic','Multi-specialty Clinic'),
 ('general-hospital','종합병원','General Hospital','General Hospital'),
 ('long-term-care','요양병원','Long-term Care Hospital','Long-term Care Hospital')
ON CONFLICT(slug) DO NOTHING;

CREATE TEMP TABLE source_departments ON COMMIT DROP AS
SELECT s.hira_hash,s.institution_type,
 jsonb_agg(jsonb_build_object('code',d.code,'name_ko',d.name_ko,'name_en',d.name_en,'slug',d.slug,'specialist_count',(item->>1)::int) ORDER BY d.code) departments,
 array_agg(DISTINCT d.slug) subject_slugs,
 coalesce(array_agg(DISTINCT d.slug) FILTER(WHERE (item->>1)::int>0),'{}'::text[]) specialist_slugs
FROM hira_department_stage_202606 s CROSS JOIN LATERAL jsonb_array_elements(s.subjects) item
JOIN hira_department_catalog d ON d.code=item->>0 GROUP BY s.hira_hash,s.institution_type;

CREATE TEMP TABLE focuses ON COMMIT DROP AS
SELECT c.id,src.*,CASE
 WHEN src.institution_type ~ '한방|한의' THEN 'korean-medicine'
 WHEN src.institution_type ~ '치과' THEN 'dentistry'
 WHEN src.institution_type ~ '요양병원' THEN 'long-term-care'
 WHEN src.institution_type ~ '종합병원' THEN 'general-hospital'
 WHEN named.matches=1 THEN named.slug
 WHEN cardinality(src.subject_slugs)=1 THEN src.subject_slugs[1]
 WHEN cardinality(src.specialist_slugs)=1 THEN src.specialist_slugs[1]
 ELSE 'medical-clinic' END focus,
 CASE WHEN src.institution_type ~ '한방|한의|치과|요양병원|종합병원' THEN 'institution_type'
 WHEN named.matches=1 THEN 'name_and_reported_department'
 WHEN cardinality(src.subject_slugs)=1 THEN 'single_reported_department'
 WHEN cardinality(src.specialist_slugs)=1 THEN 'single_specialist_department'
 ELSE 'multiple_reported_departments' END basis
FROM clinics c JOIN source_departments src ON md5(c.hira_code)=src.hira_hash
LEFT JOIN LATERAL (
 SELECT count(*) matches,min(v.slug) slug FROM (VALUES
 ('urology','비뇨의학과|비뇨기과'),('dentistry','치과'),('internal-medicine','내과'),
 ('dermatology','피부과'),('plastic-surgery','성형외과'),('pediatrics','소아청소년과|소아과'),
 ('ob-gyn','산부인과'),('orthopedics','정형외과'),('ent','이비인후과'),
 ('ophthalmology','안과'),('psychiatry','정신건강의학과|신경정신과'),('neurology','신경과'),
 ('neurosurgery','신경외과'),('family-medicine','가정의학과'),
 ('anesthesiology','마취통증의학과'),('rehabilitation','재활의학과')
 ) v(slug,pattern) WHERE c.name_ko ~ v.pattern AND v.slug=ANY(src.subject_slugs)
) named ON true;

UPDATE clinics c SET category_id=cat.id,departments=f.departments,specialist_slugs=f.specialist_slugs,
 has_specialist=cardinality(f.specialist_slugs)>0,institution_type=f.institution_type,classification_basis=f.basis,
 department_source=jsonb_build_object('provider','HIRA','as_of','2026-06-30','checked_at',current_date,'url','https://opendata.hira.or.kr/op/opc/selectOpenData.do?sno=11925')
FROM focuses f JOIN categories cat ON cat.slug=f.focus WHERE c.id=f.id AND NOT c.is_premium;

-- Preserve curated premium profiles; do not replace them with unrelated HIRA rows.
UPDATE clinics c SET has_specialist=EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(c.premium_data->'doctors','[]'::jsonb)) d WHERE lower(d->>'role_en') LIKE '%specialist%'),departments=jsonb_build_array(jsonb_build_object('code','managed','slug',cat.slug,'name_en',cat.name_en,'name_ko',cat.name_ko,'specialist_count',
 (SELECT count(*) FROM jsonb_array_elements(coalesce(c.premium_data->'doctors','[]'::jsonb)) doctor WHERE lower(doctor->>'role_en') LIKE '%specialist%'))),
 specialist_slugs=CASE WHEN EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(c.premium_data->'doctors','[]'::jsonb)) d WHERE lower(d->>'role_en') LIKE '%specialist%') THEN ARRAY[cat.slug] ELSE '{}'::text[] END,
 department_source=jsonb_build_object('provider','Clinic-managed profile','checked_at',current_date),classification_basis='clinic_managed'
FROM categories cat WHERE c.category_id=cat.id AND c.is_premium;

-- Name + province + institution type; neither fuzzy names nor branch guesses.
CREATE TEMP TABLE registry_candidates ON COMMIT DROP AS
WITH local AS (
 SELECT c.*,CASE WHEN address_ko ~ '^충청남도' THEN '충남' WHEN address_ko ~ '^충청북도' THEN '충북'
 WHEN address_ko ~ '^전라남도' THEN '전남' WHEN address_ko ~ '^전라북도' THEN '전북'
 WHEN address_ko ~ '^경상남도' THEN '경남' WHEN address_ko ~ '^경상북도' THEN '경북'
 ELSE left(address_ko,2) END province,regexp_replace(c.name_ko,'\s','','g') name_key
 FROM clinics c
)
SELECT c.id,c.address_ko,r.source_date,r.source_row,r.source_url,r.name_ko,r.region,
 count(*) OVER(PARTITION BY c.id) candidate_count
FROM local c JOIN foreign_patient_registry r
 ON c.name_key=regexp_replace(r.name_ko,'\s','','g') AND c.province=r.region
 AND c.institution_type=r.institution_type
WHERE r.status='유지' AND r.source_date='2026-07-21';

CREATE TABLE IF NOT EXISTS public.registry_link_review_20261019 (
 clinic_id uuid NOT NULL,source_row int NOT NULL,source_date date NOT NULL,
 reason text NOT NULL,PRIMARY KEY(clinic_id,source_date,source_row)
);
ALTER TABLE public.registry_link_review_20261019 ENABLE ROW LEVEL SECURITY;
WITH unique_source AS (
 SELECT source_date,source_row FROM registry_candidates
 GROUP BY source_date,source_row HAVING count(DISTINCT regexp_replace(address_ko,'\s','','g'))=1
)
UPDATE clinics c SET foreign_patient_registration=jsonb_build_object(
 'status','listed','source_date',r.source_date,'source_row',r.source_row,'source_url',r.source_url,
 'source_name',r.name_ko,'provider','Korea Health Industry Development Institute',
 'checked_at',current_date,'match_method','exact_name_province_type_unique_address')
FROM registry_candidates r JOIN unique_source u USING(source_date,source_row)
WHERE c.id=r.id AND r.candidate_count=1;

INSERT INTO registry_link_review_20261019
SELECT r.id,r.source_row,r.source_date,'ambiguous_name_or_multiple_addresses'
FROM registry_candidates r JOIN clinics c ON c.id=r.id
WHERE c.foreign_patient_registration IS NULL ON CONFLICT DO NOTHING;
COMMIT;
SELECT count(*) FILTER(WHERE department_source IS NOT NULL) department_profiles,
 count(*) FILTER(WHERE c.foreign_patient_registration->>'status'='listed') registry_profiles,
 count(*) FILTER(WHERE c.category_id<>b.category_id) changed_focus_profiles
FROM clinics c JOIN clinic_classification_backup_20261019 b USING(id);
