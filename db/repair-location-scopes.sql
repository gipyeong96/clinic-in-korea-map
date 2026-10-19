-- Preserve a rollback map; add scoped identities without deleting legacy rows.
BEGIN;
ALTER TABLE locations ALTER COLUMN slug TYPE varchar(200);
CREATE TABLE IF NOT EXISTS clinic_location_backup_20261019 AS SELECT id,location_id FROM clinics;
ALTER TABLE clinic_location_backup_20261019 ENABLE ROW LEVEL SECURITY;
CREATE TEMP TABLE scoped_clinics ON COMMIT DROP AS
WITH addresses AS (
  SELECT c.id,l.name_ko dong,l.name_en dong_en,l.name_mn dong_mn,
    split_part(trim(c.address_ko),' ',1) province,
    split_part(trim(c.address_ko),' ',2) || CASE
      WHEN split_part(trim(c.address_ko),' ',3) ~ '구$'
      THEN ' '||split_part(trim(c.address_ko),' ',3) ELSE '' END district
  FROM clinics c JOIN locations l ON l.id=c.location_id
  WHERE NOT c.is_premium AND l.level='dong'
    AND split_part(trim(c.address_ko),' ',2) ~ '(시|군|구)$'
)
SELECT *,province||'|'||district district_key,province||'|'||district||'|'||dong scope_key FROM addresses;
INSERT INTO locations(slug,name_ko,name_en,name_mn,level)
SELECT DISTINCT 'kr-'||md5(province),province,province,province,'sido' FROM scoped_clinics
ON CONFLICT(slug) DO NOTHING;
INSERT INTO locations(slug,name_ko,name_en,name_mn,level,parent_id)
SELECT DISTINCT 'kr-'||md5(s.district_key),s.district,s.district,s.district,'sigungu',p.id
FROM scoped_clinics s JOIN locations p ON p.slug='kr-'||md5(s.province)
ON CONFLICT(slug) DO NOTHING;
INSERT INTO locations(slug,name_ko,name_en,name_mn,level,parent_id)
SELECT DISTINCT ON(s.scope_key) 'kr-'||md5(s.scope_key),s.dong,s.dong_en,s.dong_mn,'dong',p.id
FROM scoped_clinics s JOIN locations p ON p.slug='kr-'||md5(s.district_key)
ON CONFLICT(slug) DO NOTHING;
UPDATE clinics c SET location_id=l.id
FROM scoped_clinics s JOIN locations l ON l.slug='kr-'||md5(s.scope_key)
WHERE c.id=s.id AND c.location_id<>l.id;
COMMIT;
SELECT count(*) AS reassigned_clinics FROM clinics c JOIN clinic_location_backup_20261019 b USING(id) WHERE c.location_id<>b.location_id;
