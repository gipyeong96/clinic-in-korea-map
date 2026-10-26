# Weekend coverage refresh and search

## Scope and evidence — 2026-10-26

NMC official list endpoint: https://www.data.go.kr/data/15000736/openapi.do

Fetched 5,960 institutions in Gangnam-gu, Seocho-gu and Songpa-gu with 14 list calls. Each district was checked against totalCount and unique HPIDs before any candidate was written. Matched against June 2026 HIRA type-31 clinics in Gangnam-gu, Seocho-gu and Jamsil-dong/Sincheon-dong: 3,374 candidates, 2,583 unique name/road-address/phone matches. Of the remaining 791, 300 had no matching name/address, 489 had a missing/different phone and 2 were ambiguous.

Saturday: 2,438 normal schedules, 143 missing, 2 requiring review. Sunday: 181 normal schedules, 2,400 missing, 2 requiring review. The original 36 pilot records had no schedule/identity change or removal. These are directory schedules, not live availability, and not a claim of nationwide coverage. List fields were cross-checked against the previous detail-response pilot.

## Refresh procedure

1. Run `python scripts/refresh-weekend-hours.py --date YYYY-MM-DD` with the approved portal key supplied through the existing local environment. No key is published. This reads the official API and local snapshot; it never changes production.
2. The ignored `data/nmc/YYYY-MM-DD/` directory contains resumable source pages, candidate.json, report.json and review.json. Failed, duplicate or incomplete source pagination aborts without publishing.
3. Review additions, changes, missing records and malformed schedules. A missing record is not a closure. Revalidate a changed identity before reuse; do not carry over old opening times as newly checked.
4. Promote candidate.json to lib/weekend-hours-pilot.json only after review, run tests/build and preview. Commit the report with the data change. Schedule recurring refresh only when separately requested; no new automation is created by this change.

## Search behavior

- One optional Saturday/Sunday selector; home remains simple. Missing/review schedules excluded; scope shown beside filters.
- Current public directory identities are rechecked. Specialty, specialist, registry, name/address, region or straight-line station/GPS radius are intersected before pagination.
- Cache only public institution rows for five minutes in small batches. Never cache search requests or GPS coordinates. Failures return errors, not successful empty results.
- Preserve weekend selection across department, station, area, nearby, pagination and detail return links. A dedicated remove-weekend option keeps other constraints.
- No database schema/settings, new analytics payloads, live opening claims, new indexable landing pages or homepage menus.
