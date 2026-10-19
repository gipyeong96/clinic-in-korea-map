-- Official registry is independent of language support. No language inference.
CREATE TABLE IF NOT EXISTS public.foreign_patient_registry (
  source_date date NOT NULL, source_row integer NOT NULL,
  name_ko text NOT NULL, status text NOT NULL, institution_type text NOT NULL,
  region text NOT NULL, source_url text NOT NULL, imported_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source_date, source_row)
);
ALTER TABLE public.foreign_patient_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS foreign_patient_registration jsonb;

CREATE TABLE IF NOT EXISTS public.rail_stations (
  id text PRIMARY KEY, name_ko text NOT NULL, line text NOT NULL,
  latitude double precision NOT NULL CHECK (latitude BETWEEN 33 AND 39),
  longitude double precision NOT NULL CHECK (longitude BETWEEN 124 AND 132),
  source_date date NOT NULL, source_url text NOT NULL
);
ALTER TABLE public.rail_stations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rail_stations' AND policyname='Public official station read') THEN
    CREATE POLICY "Public official station read" ON public.rail_stations FOR SELECT USING (true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.nearby_clinics(
  station_ids text[], radius_m integer DEFAULT 1000, category_slug text DEFAULT 'all',
  search_query text DEFAULT '', specialist_only boolean DEFAULT false, result_limit integer DEFAULT 100
) RETURNS SETOF jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  WITH distances AS (
    SELECT c.*, to_jsonb(cat) AS categories, to_jsonb(loc) AS locations,
      (SELECT min(6371008.8 * 2 * asin(sqrt(least(1.0,
        power(sin(radians(c.latitude-s.latitude)/2),2) +
        cos(radians(c.latitude))*cos(radians(s.latitude))*power(sin(radians(c.longitude-s.longitude)/2),2)
      )))) FROM rail_stations s WHERE s.id = ANY(station_ids)) AS distance_m
    FROM clinics c JOIN categories cat ON cat.id=c.category_id
      JOIN locations loc ON loc.id=c.location_id
    WHERE (category_slug='all' OR cat.slug=category_slug)
      AND (NOT specialist_only OR c.has_specialist)
      AND NOT EXISTS (
        SELECT 1 FROM regexp_split_to_table(trim(search_query), '\s+') term
        WHERE term <> '' AND position(lower(term) IN lower(concat_ws(' ',c.name_en,c.name_ko,c.address_en,c.address_ko)))=0
      )
      AND c.latitude BETWEEN 33 AND 39 AND c.longitude BETWEEN 124 AND 132
  )
  SELECT to_jsonb(d) FROM distances d
  WHERE distance_m <= least(greatest(radius_m,100),3000)
  ORDER BY distance_m, id LIMIT least(greatest(result_limit,1),200);
$$;
