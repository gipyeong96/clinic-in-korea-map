# Clinic Map cloud search-performance read

`Clinic Map Search Console` runs on weekdays at 05:00 Asia/Seoul, starting
2026-11-10. GitHub may delay scheduled jobs. Manual dispatch is for validation.
The existing 09:00 development workflow and 10:00 review schedule are unchanged.

Read the latest successful run for `.github/workflows/clinic-search-console.yml`.
Its summary and `clinic-map-gsc-<run-id>` artifact contain report.md/report.json:
recent finalized seven days, previous seven days and a 28-day reference window,
with clicks, impressions, CTR and mean position. Report dates use Pacific time.
Check checkedAt and period dates; do not treat stale or missing reports as current.

Only https://map.clinicinkorea.com/ is queried. No query text, clinic-level page
paths, conversion data, other properties or indexing actions are collected.
An empty response is 'no_rows', not fabricated zero performance. Index/noindex
verification still requires a separate approved URL Inspection read.

Existing repository secrets: CLINIC_MAP_GSC_CLIENT_ID,
CLINIC_MAP_GSC_CLIENT_SECRET, CLINIC_MAP_GSC_REFRESH_TOKEN. Secrets are available
only to the read step, never to AI development or patch-validation jobs. No
OpenAI API request, app deployment, DB change or automatic retry occurs here.
The original tasks.json, development switch, budget and schedules are preserved.

An authentication failure produces an incomplete report and a failed GSC run;
do not disable or fail unrelated development. External/testing OAuth refresh
tokens expire after seven days. Reauthorization requires the user's involvement;
publishing the shared Google app or changing its existing branding is not
authorized by this workflow. Do not overwrite secrets automatically.

References:
- https://developers.google.com/webmaster-tools/v1/searchanalytics/query
- https://developers.google.com/identity/protocols/oauth2#expiration
