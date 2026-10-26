# Condition discovery and official hours research

Checked 26 October 2026. English Clinic Map only. Production baseline: `014f577f17b82539b7887f8da2f4b1510e043b86` (PR52). Korean project is separate.

## Findings and changes

- `BPH nearby`, `cystitis near-me` and `kidney stones around me` previously failed the condition-intent matcher, even though the general search recognises these nearby phrases. They now offer explicit nearby urology discovery, without a disease keyword that would accidentally filter clinic names. Nearby results are still not condition-record filtered. Brand names, unknown areas and additional unrecognised terms continue to fall back to literal search.
- Explicit `kidney stone treatment in Jamsil` offers the historical urinary-stone category. This does not confirm treatment availability or diagnose symptoms; the existing category explanation remains visible.
- Submitted condition searches now say to choose a condition comparison or clinic search, rather than describing absent station choices.
- Comparison pages place local-directory and nearby links before the long source explanation and profile list. Jamsil station-radius discovery is labelled separately from the condition cohort's Jamsil-dong/Sincheon-dong scope.
- Profile links now open the top of a clinic detail page so contact/location information is encountered first. The HIRA evidence section and its local-comparison backlinks remain available on the profile.
- A condition-preserving other-area link uses the actual source-verified count. The homepage still has no added disease menu or shortcut.
- No changes to source records, ranking order, current service claims, analytics payloads, database writes or production configuration.

## Search Console evidence

Verified account in UI: `jowilder96@gmail.com`; property `https://map.clinicinkorea.com/`.

The 28-day selector still displays actual chart dates **15–24 October**, 35 clicks, rounded 2.42K impressions, 1.4% CTR, average position 12.9. Last update shown seven hours earlier. This is the same earlier baseline, not new growth. The first visible query rows include `dentist near me` (0 clicks / 39 impressions), `doctor near me` (0 / 15) and `hospital near me` (0 / 14). These query rows are incomplete and do not sum to the property total.

Inspected `/conditions/urinary-stones/jamsil`: Google index report says **unknown URL**, with no crawl, referring page, sitemap or selected canonical reported. Live test completed **26 October, 16:39 KST**: **URL can be indexed**. A single index request was accepted into the priority crawl queue. This is not completed indexing or a guarantee of search visibility. No repeated submission of this URL, bulk index requests or property-setting changes.

The condition routes were deployed today, after the available performance window. Do not attribute these totals to PR52 or this change, or infer AI citations, bookings or visits. Recheck equal completed date windows once post-deployment data exists; inspect query-to-page pairs with exact query filters before attributing landing pages. GA4 was not refreshed in this audit and no clinic/condition-specific analytics was added.

## Official weekend/night/ER sources

Primary catalogue checks on 26 October:

| Source | Confirmed public specification | Remaining validation |
| --- | --- | --- |
| [NMC nationwide hospital/clinic finder](https://www.data.go.kr/data/15000736/openapi.do) | Free, XML REST, nationwide; catalogue labels update cycle real time and unrestricted reuse. Development quota listed as 1,000; automatic approval. `getHsptlMdcncListInfoInqire` accepts province/district, institution type, department and `QT`: Monday–Sunday 1–7, holiday 8. | Actual account approval/quota, returned hours and missing values, refresh timestamps, last-registration/lunch/holiday exceptions, identity crosswalk to HIRA. Public response-field table did not render populated fields in this check; do not treat proposed field names as verified responses. |
| [NMC nationwide emergency institutions](https://www.data.go.kr/data/15000563/openapi.do) | Free XML REST, nationwide; catalogue describes location, representative/ER phone, beds/resources and severe-condition acceptance information; real-time update label, unrestricted reuse. Modified 27 August 2026, while temporal-coverage metadata says February 2025. | Actual endpoint specification/response, per-record freshness, approved quota (development number not populated publicly), operational interpretation and outages. Catalogue metadata alone does not prove current per-hospital availability. |

No API application, agreement acceptance, credential extraction or authenticated API call was made in this research. No new schedules or ER filters are enabled.

Suggested implementation sequence: bounded read-only sample of Saturday/Sunday schedules; reconcile NMC identifiers against HIRA using name, full address and telephone with ambiguous matches withheld; record source/retrieved time and missing/unknown states; then preview schedule-based weekend filters. Label “Scheduled Saturday/Sunday hours — call before visiting”. Current-time calculations need Korea timezone, overnight periods and holiday exceptions. ER discovery remains a separate feature; a resource indicator must never mean guaranteed acceptance. [Government guidance](https://www.korea.kr/news/customizedNewsView.do?newsId=148929239) directs visitors to confirm care times before attending.

## Validation

86 existing and extended tests passed. Production build passed. Local mobile QA at 390×844 verified nearby urology preselection without requesting GPS, explicit condition search to four Jamsil urinary-stone records, actual canonical and index/follow metadata, and no horizontal overflow. Final hosted-preview verification is recorded in the PR after deployment.
