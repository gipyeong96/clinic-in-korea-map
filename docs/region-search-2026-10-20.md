# Region search and filter continuity

## Cause and database change

Anonymous PostgREST searches for both `uiwang` and `의왕` failed with PostgreSQL
57014 (statement timeout), taking approximately 4.3s and 3.5s including network
overhead. Added four concurrent trigram indexes for name_en, name_ko, address_en,
and address_ko using db/text-search-indexes.sql. All four statements succeeded
in the Supabase production SQL editor on 2026-10-20. No clinic data was rewritten.

Subsequent anonymous requests with category/location joins returned without error:
`uiwang` 607ms (11 textual matches), `의왕` 961ms (100-record limit), `Goldman`
514ms (15 matches). These are single observations including network overhead,
not latency guarantees. A province-qualified Uiwang request returned 100 records
in 484ms, all with a Gyeonggi Uiwang address. Textual matches and city coverage
are deliberately different: English names alone do not cover all city clinics.

## Application change

- Map 31 Gyeonggi city/county names to province-qualified Korean address prefixes.
  Names checked against https://english.gg.go.kr/31-si-gun-shortcut/ and Uiwang
  against https://www.uiwang.go.kr/english/index on 2026-10-20.
- Support case-insensitive English, -si/-gun, City, and Korean suffixes.
  Preserve other terms. Explicit station queries are not treated as cities.
- Require Gyeonggi qualification for Gwangju city; bare Gwangju retains the
  existing metropolitan route. Multiple matched city names remain literal terms.
- Redirect legacy `/clinics/all/all?q=uiwang` to `/clinics/all/uiwang`, preserving
  remaining keywords and the specialist constraint.
- Department links preserve keyword, specialist constraint and station radius.

This expands the existing city mappings to Gyeonggi's 31 jurisdictions; it is not
a complete nationwide administrative-name dictionary or a typo correction engine.
Result pagination remains outside this change.

## Validation

24 automated checks and production build passed. Browser verified legacy Uiwang
redirect and matching addresses, Uiwang keyword/specialist → Dentistry, and Gangnam
Station keyword/specialist/500m → Urology with all conditions retained.
