# Homepage discovery and paged clinic results

## Discovery

Three top-level shortcuts lead to station, area and department sections. Desktop
shows three parallel cards; mobile retains all sections with anchor shortcuts.
Eight editorial station shortcuts cover major hubs/city centres: Seoul, Gangnam,
Hongik University, Busan, Seomyeon, Banwoldang, Daejeon and Gwangju Songjeong.
These are not measured search-volume rankings. Every shortcut resolves to an
existing official-coordinate station page. The full 1,127-station finder remains
available in an expandable section; results appear after entering a name or
selecting a region/line. Crawlable station region pages remain linked.

## Pagination

Results now request 25 records plus one lookahead row. Previous/next links appear
above and below the list. They preserve location, department, keyword, specialist
constraint and station radius. Changing filters/department starts at page 1.
No expensive exact total is claimed. Existing within-page duplicate-profile
collapse remains; the displayed profile count can be lower than 25.

Ordinary queries use stable premium/id ordering and inclusive database ranges.
Station queries use a new `nearby_clinics_page` RPC with stable distance/id ordering
and offset. It retains scalar coordinate-envelope bounds, exact radius filtering,
department-specific specialist filtering and SECURITY INVOKER/RLS. Applied
db/paged-station-search.sql successfully through Supabase on 2026-10-20. Existing
nearby_clinics and all clinic records remain intact; older deployments continue
to use that original RPC. Pagination requests are capped at page 10,000.

## Validation

- 27 automated tests pass, including offset/lookahead propagation, preserved
  filters, bounded page inputs and official station shortcut identities.
- Production build and TypeScript validation pass.
- Anonymous database checks: Gangnam 2km pages 1, 2 and 5 have 75 distinct IDs,
  ordered by distance within radius. A keyword/department/specialist query also
  returned matching records. Uiwang pages 1, 2 and 5 contain 71 distinct IDs,
  all with Uiwang addresses; page 5 is the last page with 21 records.
- Browser checked desktop parallel cards, mobile 320px overflow, expandable
  station search for 홍대, area anchor, station page 1 → 2 (no overlapping IDs),
  retained keyword/specialist/radius, department reset to page 1, and Uiwang's
  final page with previous links and no next link.
