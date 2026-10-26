# Dentist search titles and nearby journey

The exact query `dentist near me` had 31 impressions and no clicks in the available October 15–23 Search Console data checked October 26. This is too small to establish a cause or predict improvement. The highest-impression URL exposed a location hash in its title, description and H1.

This change reads the exact stored location and its parent IDs, then formats a scoped label using the existing bilingual administrative catalog and stored neighbourhood name. Confirmed read-only records:

| Existing slug | Scoped location |
| --- | --- |
| kr-6ded571095b0019681591048a192a00d | Gwangan-dong, Suyeong-gu, Busan |
| kr-af344017160f12a9e7abe8238a06070f | Sipjeong-dong, Bupyeong-gu, Incheon |
| kr-75e58ccd2440c14708d4649a382dcf54 | Jegi-dong, Dongdaemun-gu, Seoul |

Existing URLs, canonicals and clinic query scopes are unchanged. No neighbourhood is redirected to a larger district. Missing/broken ancestry does not produce a guessed label: the page uses a generic label and noindex. Name lookups are request-memoized and cached for one day; lookup errors are not persisted as labels. No hospital/location rows, identifiers, RLS policies or existing indexes were changed.

Dental result titles use “Dentists in …” or “Dentists near …” for stations. Descriptions name available comparison information. Nearby actions sit outside collapsed mobile search options and retain current department, keyword, specialist/registration filters and station radius. The nearby tool keeps noindex; its heading follows the selected department. Compact side-by-side department/radius controls put the location action earlier. Advanced filters remain available below it. Station fallback now uses a picker with the same search context.

GPS is still requested only by the existing explicit location button. Coordinates are not added to links or analytics. Internal QA uses preview/local hosts, which do not send application analytics.

Validation: 78 unit tests passed; production build and type checks passed for the final code revision. Preview browser checks are recorded in the PR. Evaluate eventual search changes over complete 14/28-day windows with query/page, country/device and position context; do not present generic organic traffic as verified AI citations or clinic visits.

## Intermittent list failure investigation and fix

The October 26 01:49:46 UTC Postgres log records SQLSTATE 57014, `canceling statement due to statement timeout`, for a dental list using an embedded `locations.slug` join. The old code read the whole location catalog without pagination; Supabase caps this response, so newer location IDs were absent and triggered the expensive join fallback.

The client now reads the exact slug identity, then only its descendants through parent IDs, batching/paginating child results. Unknown locations return no results without scanning clinics. Lookup failures still fail visibly; they cannot become all-Korea results. Department, keyword, registration, specialist, ordering and result pagination are unchanged.

Read-only index inspection and EXPLAIN confirmed a missing location index: the direct Gwangan dental query read roughly 20,000 other dental rows and took 6304.677 ms in that diagnostic run. Added only two indexes through remote migration `index_scoped_clinic_location_search`:

```sql
create index if not exists clinics_location_order_idx on public.clinics (location_id, is_premium desc, id);
create index if not exists locations_parent_lookup_idx on public.locations (parent_id, id);
```

The same diagnostic SQL then used `clinics_location_order_idx` and took 4.456 ms, returning 26 rows. This is database query timing, not whole-page latency or a guarantee under all loads. Unit coverage includes roots beyond the catalog cap, more than 1000 children, exclusion of unrelated IDs, filter/pagination preservation and lookup failures.
