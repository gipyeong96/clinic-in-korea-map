-- This index covers the exact fields used for ordered sitemap pagination.
-- No clinic content, policies or permissions are changed.
CREATE INDEX CONCURRENTLY IF NOT EXISTS clinics_sitemap_cover_idx
  ON public.clinics (id) INCLUDE (hira_code);
