CREATE OR REPLACE FUNCTION public.nearby_clinics(station_ids text[], radius_m integer DEFAULT 1000, category_slug text DEFAULT 'all'::text, search_query text DEFAULT ''::text, specialist_only boolean DEFAULT false, result_limit integer DEFAULT 100)
 RETURNS SETOF jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
 SET jit TO 'off'
AS $function$
  WITH station_points AS MATERIALIZED (SELECT * FROM rail_stations WHERE id=ANY(station_ids)), nearby_candidates AS MATERIALIZED (
    SELECT c.* FROM clinics c
    WHERE c.latitude BETWEEN
      (SELECT min(latitude)-least(greatest(radius_m,100),3000)/110000.0 FROM station_points)
      AND (SELECT max(latitude)+least(greatest(radius_m,100),3000)/110000.0 FROM station_points)
    AND c.longitude BETWEEN
      (SELECT min(longitude-least(greatest(radius_m,100),3000)/(110000.0*cos(radians(latitude)))) FROM station_points)
      AND (SELECT max(longitude+least(greatest(radius_m,100),3000)/(110000.0*cos(radians(latitude)))) FROM station_points)
  ), distances AS MATERIALIZED (
    SELECT c.*, to_jsonb(cat) AS categories, to_jsonb(loc) AS locations,
      (SELECT min(6371008.8 * 2 * asin(sqrt(least(1.0,
        power(sin(radians(c.latitude-s.latitude)/2),2) +
        cos(radians(c.latitude))*cos(radians(s.latitude))*power(sin(radians(c.longitude-s.longitude)/2),2)
      )))) FROM station_points s) AS distance_m
    FROM nearby_candidates c JOIN categories cat ON cat.id=c.category_id
      JOIN locations loc ON loc.id=c.location_id
    WHERE (category_slug='all' OR c.departments @> jsonb_build_array(jsonb_build_object('slug',category_slug)))
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
  ORDER BY CASE WHEN hira_code=ANY(ARRAY['JDQ4MTg4MSM1MSMkMiMkNCMkMDAkNTgxOTYxIzExIyQxIyQzIyQ5OSQzNjE4MzIjNjEjJDEjJDQjJDgz','JDQ4MTg4MSM1MSMkMiMkNCMkMDAkNTgxOTYxIzIxIyQxIyQ5IyQwMyQ0NjEwMDIjNDEjJDEjJDgjJDgz','JDU4MTI3MSM1MSMkMiMkMCMkMDAkNDgxNzAyIzExIyQyIyQzIyQwMCQzNjE4MzIjNjEjJDEjJDgjJDgz','JDU4MTI3MSM1MSMkMiMkMCMkMDAkNTgxMzUxIzExIyQxIyQ3IyQ4OSQzNjEwMDIjNzEjJDEjJDgjJDgz','JDQ4MTg4MSM1MSMkMiMkOCMkMDAkMzgxMzUxIzMxIyQyIyQ3IyQwMCQyNjEyMjIjNjEjJDEjJDAjJDgz']) OR id::text=ANY(ARRAY['a48f738d-b360-4121-8b85-d49c15889baf','85ed27c9-0b6e-45c6-81ee-5d81fe36a2fc','e5d6e98f-98b5-498f-b6ec-cc50f560ebe5','013294ef-1ab5-45e9-a4f1-068c38cc5553','9cd4a930-5820-4ac0-8081-444ac1cca448','fc5c4dae-aeed-4492-9f46-0295d5df3ad8','1abfbc12-0679-4897-8b0d-398a8633c145','13ebcee5-2afd-4917-a484-60a5a38d9f0e','d28d025c-eee5-4c0d-ae89-4ea824eaa623','58364127-19b7-4f35-bacf-4f62a0d4ef7e','6f05a9f6-9d3a-4a8e-98a1-ce1a211f4c55','bd44562e-af8c-407a-8c0b-22b95c8e81ee','c1072301-45cc-4fe4-9d88-0538511d3df8','0018c959-9e0a-4858-b27c-9f19a803a15a','3327f0c8-252b-4c3f-99ef-ab6fee61ec79']) THEN 0 ELSE 1 END, distance_m,id LIMIT least(greatest(result_limit,1),200);
$function$;

CREATE OR REPLACE FUNCTION public.nearby_clinics_page(station_ids text[], radius_m integer DEFAULT 1000, category_slug text DEFAULT 'all'::text, search_query text DEFAULT ''::text, specialist_only boolean DEFAULT false, result_limit integer DEFAULT 26, result_offset integer DEFAULT 0)
 RETURNS SETOF jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
 SET jit TO 'off'
AS $function$
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
                                                                                                  WHERE (category_slug='all' OR c.departments @> jsonb_build_array(jsonb_build_object('slug',category_slug)))
                                                                                                        AND (NOT specialist_only OR (category_slug='all' AND c.has_specialist AND c.department_source IS NOT NULL)
                                                                                                                OR (category_slug<>'all' AND c.specialist_slugs @> ARRAY[category_slug]))
                                                                                                                      AND NOT EXISTS (
                                                                                                                              SELECT 1 FROM regexp_split_to_table(trim(search_query),'\s+') term
                                                                                                                                      WHERE term<>'' AND position(lower(term) IN lower(concat_ws(' ',c.name_en,c.name_ko,c.address_en,c.address_ko)))=0
                                                                                                                                            )
                                                                                                                                                  AND c.latitude BETWEEN 33 AND 39 AND c.longitude BETWEEN 124 AND 132
                                                                                                                                                        AND NOT (c.latitude=37.5665 AND c.longitude=126.9780)
                                                                                                                                                          )
                                                                                                                                                            SELECT to_jsonb(d) FROM distances d
                                                                                                                                                              WHERE distance_m<=least(greatest(radius_m,100),3000)
                                                                                                                                                                ORDER BY CASE WHEN hira_code=ANY(ARRAY['JDQ4MTg4MSM1MSMkMiMkNCMkMDAkNTgxOTYxIzExIyQxIyQzIyQ5OSQzNjE4MzIjNjEjJDEjJDQjJDgz','JDQ4MTg4MSM1MSMkMiMkNCMkMDAkNTgxOTYxIzIxIyQxIyQ5IyQwMyQ0NjEwMDIjNDEjJDEjJDgjJDgz','JDU4MTI3MSM1MSMkMiMkMCMkMDAkNDgxNzAyIzExIyQyIyQzIyQwMCQzNjE4MzIjNjEjJDEjJDgjJDgz','JDU4MTI3MSM1MSMkMiMkMCMkMDAkNTgxMzUxIzExIyQxIyQ3IyQ4OSQzNjEwMDIjNzEjJDEjJDgjJDgz','JDQ4MTg4MSM1MSMkMiMkOCMkMDAkMzgxMzUxIzMxIyQyIyQ3IyQwMCQyNjEyMjIjNjEjJDEjJDAjJDgz']) OR id::text=ANY(ARRAY['a48f738d-b360-4121-8b85-d49c15889baf','85ed27c9-0b6e-45c6-81ee-5d81fe36a2fc','e5d6e98f-98b5-498f-b6ec-cc50f560ebe5','013294ef-1ab5-45e9-a4f1-068c38cc5553','9cd4a930-5820-4ac0-8081-444ac1cca448','fc5c4dae-aeed-4492-9f46-0295d5df3ad8','1abfbc12-0679-4897-8b0d-398a8633c145','13ebcee5-2afd-4917-a484-60a5a38d9f0e','d28d025c-eee5-4c0d-ae89-4ea824eaa623','58364127-19b7-4f35-bacf-4f62a0d4ef7e','6f05a9f6-9d3a-4a8e-98a1-ce1a211f4c55','bd44562e-af8c-407a-8c0b-22b95c8e81ee','c1072301-45cc-4fe4-9d88-0538511d3df8','0018c959-9e0a-4858-b27c-9f19a803a15a','3327f0c8-252b-4c3f-99ef-ab6fee61ec79']) THEN 0 ELSE 1 END, distance_m,id
                                                                                                                                                                  LIMIT least(greatest(result_limit,1),101)
                                                                                                                                                                    OFFSET least(greatest(result_offset,0),250000);
                                                                                                                                                                    $function$;

CREATE OR REPLACE FUNCTION public.nearby_location_clinics_page(origin_lat double precision, origin_lng double precision, radius_m integer DEFAULT 1000, category_slug text DEFAULT 'all'::text, search_query text DEFAULT ''::text, specialist_only boolean DEFAULT false, registered_only boolean DEFAULT false, result_limit integer DEFAULT 26, result_offset integer DEFAULT 0)
 RETURNS SETOF jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
 SET jit TO 'off'
AS $function$
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
      AND (category_slug='all' OR c.departments @> jsonb_build_array(jsonb_build_object('slug',category_slug)))
      AND (NOT specialist_only OR (category_slug='all' AND c.has_specialist AND c.department_source IS NOT NULL)
        OR (category_slug<>'all' AND c.specialist_slugs @> ARRAY[category_slug]))
      AND NOT EXISTS (
        SELECT 1 FROM regexp_split_to_table(trim(search_query),'\s+') term
        WHERE term<>'' AND position(lower(term) IN lower(concat_ws(' ',c.name_en,c.name_ko,c.address_en,c.address_ko)))=0
      )
      AND c.latitude BETWEEN 33 AND 39 AND c.longitude BETWEEN 124 AND 132
      AND NOT (c.latitude=37.5665 AND c.longitude=126.9780)
  )
  SELECT to_jsonb(d) FROM distances d
  WHERE distance_m<=least(greatest(radius_m,100),5000)
  ORDER BY CASE WHEN hira_code=ANY(ARRAY['JDQ4MTg4MSM1MSMkMiMkNCMkMDAkNTgxOTYxIzExIyQxIyQzIyQ5OSQzNjE4MzIjNjEjJDEjJDQjJDgz','JDQ4MTg4MSM1MSMkMiMkNCMkMDAkNTgxOTYxIzIxIyQxIyQ5IyQwMyQ0NjEwMDIjNDEjJDEjJDgjJDgz','JDU4MTI3MSM1MSMkMiMkMCMkMDAkNDgxNzAyIzExIyQyIyQzIyQwMCQzNjE4MzIjNjEjJDEjJDgjJDgz','JDU4MTI3MSM1MSMkMiMkMCMkMDAkNTgxMzUxIzExIyQxIyQ3IyQ4OSQzNjEwMDIjNzEjJDEjJDgjJDgz','JDQ4MTg4MSM1MSMkMiMkOCMkMDAkMzgxMzUxIzMxIyQyIyQ3IyQwMCQyNjEyMjIjNjEjJDEjJDAjJDgz']) OR id::text=ANY(ARRAY['a48f738d-b360-4121-8b85-d49c15889baf','85ed27c9-0b6e-45c6-81ee-5d81fe36a2fc','e5d6e98f-98b5-498f-b6ec-cc50f560ebe5','013294ef-1ab5-45e9-a4f1-068c38cc5553','9cd4a930-5820-4ac0-8081-444ac1cca448','fc5c4dae-aeed-4492-9f46-0295d5df3ad8','1abfbc12-0679-4897-8b0d-398a8633c145','13ebcee5-2afd-4917-a484-60a5a38d9f0e','d28d025c-eee5-4c0d-ae89-4ea824eaa623','58364127-19b7-4f35-bacf-4f62a0d4ef7e','6f05a9f6-9d3a-4a8e-98a1-ce1a211f4c55','bd44562e-af8c-407a-8c0b-22b95c8e81ee','c1072301-45cc-4fe4-9d88-0538511d3df8','0018c959-9e0a-4858-b27c-9f19a803a15a','3327f0c8-252b-4c3f-99ef-ab6fee61ec79']) THEN 0 ELSE 1 END, distance_m,id
  LIMIT least(greatest(result_limit,1),101)
  OFFSET least(greatest(result_offset,0),250000);
$function$;

CREATE OR REPLACE FUNCTION public.nearby_registered_clinics_page(station_ids text[], radius_m integer DEFAULT 1000, category_slug text DEFAULT 'all'::text, search_query text DEFAULT ''::text, specialist_only boolean DEFAULT false, result_limit integer DEFAULT 26, result_offset integer DEFAULT 0)
 RETURNS SETOF jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
 SET jit TO 'off'
AS $function$
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
      AND (category_slug='all' OR c.departments @> jsonb_build_array(jsonb_build_object('slug',category_slug)))
      AND (NOT specialist_only OR (category_slug='all' AND c.has_specialist AND c.department_source IS NOT NULL)
        OR (category_slug<>'all' AND c.specialist_slugs @> ARRAY[category_slug]))
      AND NOT EXISTS (
        SELECT 1 FROM regexp_split_to_table(trim(search_query),'\s+') term
        WHERE term<>'' AND position(lower(term) IN lower(concat_ws(' ',c.name_en,c.name_ko,c.address_en,c.address_ko)))=0
      )
      AND c.latitude BETWEEN 33 AND 39 AND c.longitude BETWEEN 124 AND 132
      AND NOT (c.latitude=37.5665 AND c.longitude=126.9780)
  )
  SELECT to_jsonb(d) FROM distances d
  WHERE distance_m<=least(greatest(radius_m,100),3000)
  ORDER BY CASE WHEN hira_code=ANY(ARRAY['JDQ4MTg4MSM1MSMkMiMkNCMkMDAkNTgxOTYxIzExIyQxIyQzIyQ5OSQzNjE4MzIjNjEjJDEjJDQjJDgz','JDQ4MTg4MSM1MSMkMiMkNCMkMDAkNTgxOTYxIzIxIyQxIyQ5IyQwMyQ0NjEwMDIjNDEjJDEjJDgjJDgz','JDU4MTI3MSM1MSMkMiMkMCMkMDAkNDgxNzAyIzExIyQyIyQzIyQwMCQzNjE4MzIjNjEjJDEjJDgjJDgz','JDU4MTI3MSM1MSMkMiMkMCMkMDAkNTgxMzUxIzExIyQxIyQ3IyQ4OSQzNjEwMDIjNzEjJDEjJDgjJDgz','JDQ4MTg4MSM1MSMkMiMkOCMkMDAkMzgxMzUxIzMxIyQyIyQ3IyQwMCQyNjEyMjIjNjEjJDEjJDAjJDgz']) OR id::text=ANY(ARRAY['a48f738d-b360-4121-8b85-d49c15889baf','85ed27c9-0b6e-45c6-81ee-5d81fe36a2fc','e5d6e98f-98b5-498f-b6ec-cc50f560ebe5','013294ef-1ab5-45e9-a4f1-068c38cc5553','9cd4a930-5820-4ac0-8081-444ac1cca448','fc5c4dae-aeed-4492-9f46-0295d5df3ad8','1abfbc12-0679-4897-8b0d-398a8633c145','13ebcee5-2afd-4917-a484-60a5a38d9f0e','d28d025c-eee5-4c0d-ae89-4ea824eaa623','58364127-19b7-4f35-bacf-4f62a0d4ef7e','6f05a9f6-9d3a-4a8e-98a1-ce1a211f4c55','bd44562e-af8c-407a-8c0b-22b95c8e81ee','c1072301-45cc-4fe4-9d88-0538511d3df8','0018c959-9e0a-4858-b27c-9f19a803a15a','3327f0c8-252b-4c3f-99ef-ab6fee61ec79']) THEN 0 ELSE 1 END, distance_m,id
  LIMIT least(greatest(result_limit,1),101)
  OFFSET least(greatest(result_offset,0),250000);
$function$;
