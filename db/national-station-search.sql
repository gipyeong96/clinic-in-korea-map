CREATE INDEX IF NOT EXISTS clinics_station_coordinates_idx ON public.clinics (latitude,longitude);
CREATE OR REPLACE FUNCTION public.nearby_clinics(
  station_ids text[], radius_m integer DEFAULT 1000, category_slug text DEFAULT 'all',
  search_query text DEFAULT '', specialist_only boolean DEFAULT false, result_limit integer DEFAULT 100
) RETURNS SETOF jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public SET jit = off AS $$
  WITH station_points AS MATERIALIZED (SELECT * FROM rail_stations WHERE id=ANY(station_ids)), nearby_candidates AS MATERIALIZED (
    SELECT c.* FROM clinics c WHERE EXISTS (
      SELECT 1 FROM station_points s
      WHERE c.latitude BETWEEN s.latitude-least(greatest(radius_m,100),3000)/110000.0 AND s.latitude+least(greatest(radius_m,100),3000)/110000.0
      AND c.longitude BETWEEN s.longitude-least(greatest(radius_m,100),3000)/(110000.0*cos(radians(s.latitude))) AND s.longitude+least(greatest(radius_m,100),3000)/(110000.0*cos(radians(s.latitude)))
    )
  ), distances AS MATERIALIZED (
    SELECT c.*, to_jsonb(cat) AS categories, to_jsonb(loc) AS locations,
      (SELECT min(6371008.8 * 2 * asin(sqrt(least(1.0,
        power(sin(radians(c.latitude-s.latitude)/2),2) +
        cos(radians(c.latitude))*cos(radians(s.latitude))*power(sin(radians(c.longitude-s.longitude)/2),2)
      )))) FROM station_points s) AS distance_m
    FROM nearby_candidates c JOIN categories cat ON cat.id=c.category_id
      JOIN locations loc ON loc.id=c.location_id
    WHERE EXISTS (
        SELECT 1 FROM rail_stations s WHERE s.id=ANY(station_ids)
          AND c.latitude BETWEEN s.latitude-least(greatest(radius_m,100),3000)/110000.0 AND s.latitude+least(greatest(radius_m,100),3000)/110000.0
          AND c.longitude BETWEEN s.longitude-least(greatest(radius_m,100),3000)/(110000.0*cos(radians(s.latitude))) AND s.longitude+least(greatest(radius_m,100),3000)/(110000.0*cos(radians(s.latitude)))
      )
      AND (category_slug='all' OR c.departments @> jsonb_build_array(jsonb_build_object('slug',category_slug)))
      AND (NOT specialist_only OR CASE WHEN category_slug='all' THEN c.has_specialist AND c.department_source IS NOT NULL ELSE category_slug=ANY(c.specialist_slugs) END)
      AND NOT EXISTS (
        SELECT 1 FROM regexp_split_to_table(trim(search_query), '\s+') term
        WHERE term <> '' AND position(lower(term) IN lower(concat_ws(' ',c.name_en,c.name_ko,c.address_en,c.address_ko)))=0
      )
      AND c.latitude BETWEEN 33 AND 39 AND c.longitude BETWEEN 124 AND 132
      -- The original HIRA importer substituted this city-centre point when
      -- coordinates were absent. It cannot support a measured station distance.
      AND NOT (c.latitude=37.5665 AND c.longitude=126.9780)
  )
  SELECT to_jsonb(d) FROM distances d
  WHERE distance_m <= least(greatest(radius_m,100),3000)
  ORDER BY distance_m, id LIMIT least(greatest(result_limit,1),200);
$$;
