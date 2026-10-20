-- Run each statement separately, outside a transaction. Additive, no record edits.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX CONCURRENTLY IF NOT EXISTS clinics_name_en_trgm_idx ON public.clinics USING gin (name_en gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS clinics_name_ko_trgm_idx ON public.clinics USING gin (name_ko gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS clinics_address_en_trgm_idx ON public.clinics USING gin (address_en gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS clinics_address_ko_trgm_idx ON public.clinics USING gin (address_ko gin_trgm_ops);
