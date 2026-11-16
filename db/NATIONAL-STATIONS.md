# Nationwide station search

The station directory contains 1,127 search pages and 1,281 line coordinate records. It is a directory of dated official records, not a live service map or timetable. It does not claim every currently operating railway station is present. Stations without verified coordinates or an English name are excluded. Regional rail entries are separate from urban rail and do not imply a particular train stops there today.

## Inputs

- KRIC official operator-specific station history / standard station XLSX files: https://data.kric.go.kr/rips/M_01_01/intro.do?keywords=역사정보
- Daegu decimal coordinate supplement: https://data.kric.go.kr/rips/M_01_01/detail.do?id=213 (portal record updated 2026-02-05; this is not a coordinate survey date). English names are matched by exact normalized Korean name against the Daegu standard history file (id 35).
- National Railroad Authority railway station information: https://www.data.go.kr/data/15067652/fileData.do (snapshot 2025-07-11). Only records reporting passenger handling and valid coordinates / English names are included. Descriptions identifying a closed station are excluded; historical text is not a live operating status check.
- `national-station-sources.json` records downloaded filenames, official URLs and SHA256 hashes. Raw official files remain in ignored `data/rail/`.

## Preparation and validation

Install the existing dependencies in `scripts/`, then run `node scripts/prepare-national-stations.cjs`. Inputs are the unmodified XLSX files named by source ID, `manifest.json`, the Daegu `213.xlsx` file, and the CP949 mainline CSV saved as `mainline.zip` (the server sends CSV despite the local extension). Outputs are `lib/stations.json`, `data/rail/import.sql`, and a private exclusion report `data/rail/issues.json`.

Two aggregate datasets (32 and 1294) are excluded: they duplicate operator files and contain inconsistent coordinate/name rows. Coordinates outside Korea or the relevant operator area are excluded. Unambiguously swapped latitude/longitude values are swapped, never guessed or geocoded. Malformed DMS values are excluded, with exact-name decimal supplementation for Daegu. Unknown and future dates are excluded. Source dates use row dates where present; dated filenames provide fallback dates. The Daegu supplement uses its portal record update date as described above.

Line records use the newest valid row for each network/name/normalized line. Same-name stations in different networks remain separate. Transfer coordinates are grouped only when each is within 0.012 degrees in each axis of the first coordinate. Existing Seoul/Gangnam/Jamsil URLs are retained. Source links and dates remain attached to individual line records. Mainline and urban rail may have separate entries for the same named complex; they are explicitly distinguished by line and region.

The import upserts only generated station IDs, preserving existing records and access policies. Earlier intermediate station records are retained but not referenced by the published directory. `national-station-search.sql` adds a coordinate index and updates the existing security-invoker RPC: materialized station points and bounding-box candidates precede exact spherical distance calculation. JIT is disabled for this function to avoid startup cost on short requests. The bounding box is conservative; the final exact distance cutoff and ordering remain before the result limit. No permissions are widened.

Checks: `node --test tests/search.test.cjs`, `npm run build`, and read-only `node tests/live-national-stations.cjs`. Live checks verify every referenced station ID and radius/order for Seomyeon, Banwoldang, Culture Complex, Daejeon and Gangneung. Search results remain capped at 100 profiles, with that limit disclosed in the interface.

Production follow-up: the original correlated bounding-box EXISTS still allowed a sequential scan of 53,006 clinic rows. Scalar min/max envelope bounds now let PostgreSQL use `clinics_station_coordinates_idx` directly, then retain the exact nearest-station distance cutoff. Under the anonymous visitor role, Seomyeon EXPLAIN ANALYZE changed from about 2,411 ms to 30 ms, examining 341 candidate rows. This records a database-only correction already applied during deployment verification; it does not change the frontend or result semantics.
