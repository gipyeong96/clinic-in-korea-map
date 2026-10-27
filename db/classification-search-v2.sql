-- Add a paged RPC without replacing the production nearby_clinics function.
-- Scalar station envelope bounds retain use of clinics_station_coordinates_idx.
CREATE OR REPLACE FUNCTION public.nearby_clinics_page_v2(
  station_ids text[], radius_m integer DEFAULT 1000, category_slug text DEFAULT 'all',
  search_query text DEFAULT '', specialist_only boolean DEFAULT false,
  result_limit integer DEFAULT 26, result_offset integer DEFAULT 0
) RETURNS SETOF jsonb LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public SET jit = off AS $$
  WITH station_points AS MATERIALIZED (
    SELECT * FROM rail_stations WHERE id=ANY(station_ids)
  ), nearby_candidates AS MATERIALIZED (
    SELECT c.* FROM clinics c
    WHERE c.latitude BETWEEN
      (SELECT min(latitude)-least(greatest(radius_m,100),3000)/110000.0 FROM station_points)
      AND (SELECT max(latitude)+least(greatest(radius_m,100),3000)/110000.0 FROM station_points)
    AND c.longitude BETWEEN
      (SELECT min(longitude-least(greatest(radius_m,100),3000)/(110000.0*cos(radians(latitude)))) FROM station_points)
      AND (SELECT max(longitude+least(greatest(radius_m,100),3000)/(110000.0*cos(radians(latitude)))) FROM station_points)
  ), distances AS MATERIALIZED (
    SELECT c.*,to_jsonb(cat) AS categories,to_jsonb(loc) AS locations,
      (SELECT min(6371008.8*2*asin(sqrt(least(1.0,
        power(sin(radians(c.latitude-s.latitude)/2),2)+
        cos(radians(c.latitude))*cos(radians(s.latitude))*power(sin(radians(c.longitude-s.longitude)/2),2)
      )))) FROM station_points s) AS distance_m
    FROM nearby_candidates c JOIN categories cat ON cat.id=c.category_id
      JOIN locations loc ON loc.id=c.location_id
    WHERE (category_slug='all' OR CASE WHEN category_slug IN ('medical-clinic','general-hospital','long-term-care') THEN cat.slug=category_slug ELSE c.departments @> jsonb_build_array(jsonb_build_object('slug',category_slug)) END)
      AND (NOT specialist_only OR (category_slug IN ('all','medical-clinic','general-hospital','long-term-care') AND c.has_specialist AND c.department_source IS NOT NULL)
        OR (category_slug NOT IN ('all','medical-clinic','general-hospital','long-term-care') AND c.specialist_slugs @> ARRAY[category_slug]))
      AND NOT EXISTS (
        SELECT 1 FROM regexp_split_to_table(trim(search_query),'\s+') term
        WHERE term<>'' AND position(lower(term) IN lower(concat_ws(' ',c.name_en,c.name_ko,c.address_en,c.address_ko)))=0
      )
      AND c.latitude BETWEEN 33 AND 39 AND c.longitude BETWEEN 124 AND 132
      AND NOT (c.latitude=37.5665 AND c.longitude=126.9780)
  )
  SELECT to_jsonb(d) FROM distances d
  WHERE distance_m<=least(greatest(radius_m,100),3000)
  ORDER BY distance_m,id
  LIMIT least(greatest(result_limit,1),101)
  OFFSET least(greatest(result_offset,0),250000);
$$;
GRANT EXECUTE ON FUNCTION public.nearby_clinics_page_v2(text[],integer,text,text,boolean,integer,integer) TO anon,authenticated;

-- Add a paged RPC without replacing the production nearby_clinics function.
-- Scalar station envelope bounds retain use of clinics_station_coordinates_idx.
CREATE OR REPLACE FUNCTION public.nearby_registered_clinics_page_v2(
  station_ids text[], radius_m integer DEFAULT 1000, category_slug text DEFAULT 'all',
  search_query text DEFAULT '', specialist_only boolean DEFAULT false,
  result_limit integer DEFAULT 26, result_offset integer DEFAULT 0
) RETURNS SETOF jsonb LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public SET jit = off AS $$
  WITH station_points AS MATERIALIZED (
    SELECT * FROM rail_stations WHERE id=ANY(station_ids)
  ), nearby_candidates AS MATERIALIZED (
    SELECT c.* FROM clinics c
    WHERE c.latitude BETWEEN
      (SELECT min(latitude)-least(greatest(radius_m,100),3000)/110000.0 FROM station_points)
      AND (SELECT max(latitude)+least(greatest(radius_m,100),3000)/110000.0 FROM station_points)
    AND c.longitude BETWEEN
      (SELECT min(longitude-least(greatest(radius_m,100),3000)/(110000.0*cos(radians(latitude)))) FROM station_points)
      AND (SELECT max(longitude+least(greatest(radius_m,100),3000)/(110000.0*cos(radians(latitude)))) FROM station_points)
  ), distances AS MATERIALIZED (
    SELECT c.*,to_jsonb(cat) AS categories,to_jsonb(loc) AS locations,
      (SELECT min(6371008.8*2*asin(sqrt(least(1.0,
        power(sin(radians(c.latitude-s.latitude)/2),2)+
        cos(radians(c.latitude))*cos(radians(s.latitude))*power(sin(radians(c.longitude-s.longitude)/2),2)
      )))) FROM station_points s) AS distance_m
    FROM nearby_candidates c JOIN categories cat ON cat.id=c.category_id
      JOIN locations loc ON loc.id=c.location_id
    WHERE c.foreign_patient_registration->>'status'='listed'
      AND c.foreign_patient_registration->>'source_date' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
      AND (category_slug='all' OR CASE WHEN category_slug IN ('medical-clinic','general-hospital','long-term-care') THEN cat.slug=category_slug ELSE c.departments @> jsonb_build_array(jsonb_build_object('slug',category_slug)) END)
      AND (NOT specialist_only OR (category_slug IN ('all','medical-clinic','general-hospital','long-term-care') AND c.has_specialist AND c.department_source IS NOT NULL)
        OR (category_slug NOT IN ('all','medical-clinic','general-hospital','long-term-care') AND c.specialist_slugs @> ARRAY[category_slug]))
      AND NOT EXISTS (
        SELECT 1 FROM regexp_split_to_table(trim(search_query),'\s+') term
        WHERE term<>'' AND position(lower(term) IN lower(concat_ws(' ',c.name_en,c.name_ko,c.address_en,c.address_ko)))=0
      )
      AND c.latitude BETWEEN 33 AND 39 AND c.longitude BETWEEN 124 AND 132
      AND NOT (c.latitude=37.5665 AND c.longitude=126.9780)
  )
  SELECT to_jsonb(d) FROM distances d
  WHERE distance_m<=least(greatest(radius_m,100),3000)
  ORDER BY distance_m,id
  LIMIT least(greatest(result_limit,1),101)
  OFFSET least(greatest(result_offset,0),250000);
$$;
GRANT EXECUTE ON FUNCTION public.nearby_registered_clinics_page_v2(text[],integer,text,text,boolean,integer,integer) TO anon,authenticated;

-- Add a paged RPC without replacing the production nearby_clinics function.
-- Scalar station envelope bounds retain use of clinics_station_coordinates_idx.
CREATE OR REPLACE FUNCTION public.nearby_location_clinics_page_v2(
  origin_lat double precision, origin_lng double precision, radius_m integer DEFAULT 1000, category_slug text DEFAULT 'all',
  search_query text DEFAULT '', specialist_only boolean DEFAULT false, registered_only boolean DEFAULT false,
  result_limit integer DEFAULT 26, result_offset integer DEFAULT 0
) RETURNS SETOF jsonb LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public SET jit = off AS $$
  WITH station_points AS MATERIALIZED (
    SELECT origin_lat AS latitude,origin_lng AS longitude WHERE origin_lat BETWEEN 33 AND 39 AND origin_lng BETWEEN 124 AND 132
  ), nearby_candidates AS MATERIALIZED (
    SELECT c.* FROM clinics c
    WHERE c.latitude BETWEEN
      (SELECT min(latitude)-least(greatest(radius_m,100),5000)/110000.0 FROM station_points)
      AND (SELECT max(latitude)+least(greatest(radius_m,100),5000)/110000.0 FROM station_points)
    AND c.longitude BETWEEN
      (SELECT min(longitude-least(greatest(radius_m,100),5000)/(110000.0*cos(radians(latitude)))) FROM station_points)
      AND (SELECT max(longitude+least(greatest(radius_m,100),5000)/(110000.0*cos(radians(latitude)))) FROM station_points)
  ), distances AS MATERIALIZED (
    SELECT c.*,to_jsonb(cat) AS categories,to_jsonb(loc) AS locations,
      (SELECT min(6371008.8*2*asin(sqrt(least(1.0,
        power(sin(radians(c.latitude-s.latitude)/2),2)+
        cos(radians(c.latitude))*cos(radians(s.latitude))*power(sin(radians(c.longitude-s.longitude)/2),2)
      )))) FROM station_points s) AS distance_m
    FROM nearby_candidates c JOIN categories cat ON cat.id=c.category_id
      JOIN locations loc ON loc.id=c.location_id
    WHERE (NOT registered_only OR (c.foreign_patient_registration->>'status'='listed' AND c.foreign_patient_registration->>'source_date' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'))
      AND (category_slug='all' OR CASE WHEN category_slug IN ('medical-clinic','general-hospital','long-term-care') THEN cat.slug=category_slug ELSE c.departments @> jsonb_build_array(jsonb_build_object('slug',category_slug)) END)
      AND (NOT specialist_only OR (category_slug IN ('all','medical-clinic','general-hospital','long-term-care') AND c.has_specialist AND c.department_source IS NOT NULL)
        OR (category_slug NOT IN ('all','medical-clinic','general-hospital','long-term-care') AND c.specialist_slugs @> ARRAY[category_slug]))
      AND NOT EXISTS (
        SELECT 1 FROM regexp_split_to_table(trim(search_query),'\s+') term
        WHERE term<>'' AND position(lower(term) IN lower(concat_ws(' ',c.name_en,c.name_ko,c.address_en,c.address_ko)))=0
      )
      AND c.latitude BETWEEN 33 AND 39 AND c.longitude BETWEEN 124 AND 132
      AND NOT (c.latitude=37.5665 AND c.longitude=126.9780)
  )
  SELECT to_jsonb(d) FROM distances d
  WHERE distance_m<=least(greatest(radius_m,100),5000)
  ORDER BY distance_m,id
  LIMIT least(greatest(result_limit,1),101)
  OFFSET least(greatest(result_offset,0),250000);
$$;
GRANT EXECUTE ON FUNCTION public.nearby_location_clinics_page_v2(double precision,double precision,integer,text,text,boolean,boolean,integer,integer) TO anon,authenticated;
