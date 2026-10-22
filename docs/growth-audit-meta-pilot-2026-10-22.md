# Growth baseline, measurement audit and Meta pilot — 22 October 2026

## Verified accounts and source windows

- Google account: jowilder96@gmail.com. Search Console: https://map.clinicinkorea.com/. GA4 account 386936850, property 559263056, stream 16141661677, measurement ID G-0TP3EDEP3R.
- Search Console seven-day selector: 1 click, 92 impressions, 1.1% CTR, average position 19; visible chart dates 15–19 October. GA4 home last-seven-day card (15–21 October): 22 active users, 331 views, 522 events, zero key events. Windows differ; internal QA may be included. No causal lift or confirmed customer conversion is established.
- Page indexing report updated 16 October: 369 indexed, 48 excluded: 10 duplicate without user-selected canonical, 1 noindex, 37 crawled but not indexed. Do not compare this old report directly with later discovered-URL totals.
- Sitemap report: /sitemap.xml successful, last read 21 October, 1,522 discovered pages. /clinic-sitemaps.xml successful, last read 21 October, 53,006 discovered pages. Discovered does not mean indexed; totals may overlap.

## Landing and index findings

- Home, /clinics/urology/gangnam, /guides/choose-urology-clinic-gangnam and /clinics/detail/goldman-gangnam currently have specific titles, visible H1s and production canonical URLs. This does not establish Google-selected canonicals or indexed status for each URL.
- /nearby is intentionally noindex, follow. It is an interactive location tool, so organic near-me entry should be measured on the home/guide landing and its onward use, not assumed to rank at /nearby.
- Duplicate examples include /clinics/dentistry/seocheoneup and imported detail IDs. Crawled-but-unindexed examples include /clinics/urology/gyodong and /clinics/urology/mullaedong3ga plus imported detail IDs.
- Live /clinics/urology/gyodong ultimately returned zero profiles with a self-canonical (one earlier request showed a temporary data error). This is a weak legacy dong-only landing, not evidence that no local clinics exist. Do not redirect ambiguous dong names to a guessed city or delete hospital profiles.
- Next SEO work: inspect Google-selected canonicals for the ten duplicates, resolve legacy locations only with unambiguous official mappings, and review unique source-backed profile content. Check priority home/guide/area URLs individually before requesting indexing. No blanket validation or mass indexing request was submitted in this audit.

## Measurement changes and deployment gate

- Browser opt-out at /measurement prevents the application analytics script from loading after reload; preview hosts never initialize analytics. Past history and saved clinics stay intact. Use this before future production QA. No irreversible GA data-exclusion filter was activated.
- New application payloads contain only fixed page groups (home/results/profile/nearby/areas/stations/guides/library/other), fixed action names and a synthetic /measure/<group> location. These synthetic URLs are reporting labels, not SEO landing pages. Do not sum them with prior raw-path trends without noting the schema break.
- No clinic ID/name/telephone/address, department, search term, exact GPS, result count or raw outgoing link enters the new event payload. Referrer is blank. Google still receives ordinary technical service data; this is not a claim of anonymity.
- Events: page_view; search_submit (attempt, not successful results); call_click and directions_click (intent, not completed calls/visits); clinic_save (successful local save); share_request, share_complete (browser API completion, not recipient delivery), link_copy (successful clipboard write), compare_request (attempt).
- Neutral campaign attribution only accepts utm_source=facebook|instagram, utm_medium=paid_social, utm_campaign=tool_intro_v1 and utm_content=search_first|quokka_intro. Other campaign/free-text values are discarded. Initial campaign settings apply to the GA session; cross-session user attribution is not independently verified.
- GA4 enhanced measurement was inspected: six automatic event types and browser-history page changes were on. On 22 October, automatic scroll/outbound/search/form/video/download events and history-based page changes were disabled to prevent raw URL/link/query parameters and duplicate manual pageviews. Page-load setting and stream IDs remain unchanged. Existing event history is preserved; automatic event volumes will change from this date.
- Application code remains PR/preview until approved. Production custom-event arrival must be checked after deployment, before marking any event as a key event. No fabricated appointment/lead conversion or Meta pixel was added.

## Meta pilot proposal — not launched

Purpose: find whether a general clinic-finder introduction brings useful exploration, rather than optimizing for video reactions alone.

1. First reuse the existing Clinic in Korea Coco reel. New medical creative production is not the default. Confirm reuse rights, destination and any required creative review before publishing; do not reset existing posts, campaigns or accumulated results.
2. Proposed cap for approval: KRW 70,000 total over seven days (around KRW 10,000/day, taxes and account billing treatment to be confirmed). This is an experiment allocation, not a price quote or predicted result. Configure an enforceable total cap/end date; no auto-extension.
3. Start with one campaign/ad set/creative to avoid splitting a tiny sample. Use the actual account's available website-traffic settings after review. Initial audience hypothesis: people in Korea able to use English; do not infer nationality, medical diagnoses or health-interest audiences. Separate tourist messaging only if data supports a later test.
4. Neutral destination: https://map.clinicinkorea.com/?utm_source=facebook&utm_medium=paid_social&utm_campaign=tool_intro_v1&utm_content=quokka_intro (instagram source for Instagram). The existing search-first route is on the same home page. A second search-first video is a later reviewed hypothesis, not a simultaneously authorized new creative.
5. Primary evaluation: attributed engaged sessions and profile-page-group exploration per spend, plus aggregate contact/directions actions if volume is adequate. Secondary: outbound clicks, CPC and video retention. Never call an ad click, phone click or share a patient/appointment.
6. Before launch: validate approved campaign tags, GA session attribution and aggregate events; check that no health paths/search/GPS are sent to Meta. No Pixel/CAPI or retargeting setup is authorized or installed here. If no eligible privacy-safe tracking option exists, use tagged visits and report the measurement limits.
7. Stop conditions: broken destination, invalid attribution, wrong geography, unexpected sensitive payload, or total cap reached. At day seven, stop and review. Do not declare an A/B winner from small counts or increase spend automatically. Document a continuation threshold after a baseline is available.

## Operational sequence

Approve/deploy measurement code → exclude internal QA browser → verify actual event receipt → establish one clean weekly baseline → approve a capped Meta pilot → compare acquisition and onsite exploration → prioritize SEO/landing changes supported by evidence.

Official references checked 22 October 2026:
- https://support.google.com/analytics/answer/10104470 (internal filters; active exclusion is irreversible)
- https://support.google.com/analytics/answer/9267735 (events need explicit implementation)
- https://support.google.com/analytics/answer/9216061 (enhanced measurement)
- https://www.facebook.com/business/help/1438417719786914 (official objective page was login/temporarily-blocked during automated retrieval; exact current account options remain to be verified)
