BEGIN;
CREATE TABLE IF NOT EXISTS public.hira_department_stage_202606 (
  hira_hash text PRIMARY KEY,name_ko text NOT NULL,institution_type text NOT NULL,subjects jsonb NOT NULL
);
ALTER TABLE public.hira_department_stage_202606 ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.hira_department_catalog (
  code text PRIMARY KEY,name_ko text NOT NULL,slug text NOT NULL,name_en text NOT NULL
);
ALTER TABLE public.hira_department_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS departments jsonb;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS specialist_slugs text[];
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS department_source jsonb;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS institution_type text;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS classification_basis text;
CREATE INDEX IF NOT EXISTS clinics_departments_gin ON public.clinics USING gin(departments);
CREATE INDEX IF NOT EXISTS clinics_specialist_slugs_gin ON public.clinics USING gin(specialist_slugs);
CREATE TABLE IF NOT EXISTS public.clinic_classification_backup_20261019 AS
SELECT id,category_id,has_specialist,foreign_patient_registration FROM public.clinics;
ALTER TABLE public.clinic_classification_backup_20261019 ENABLE ROW LEVEL SECURITY;
COMMIT;
