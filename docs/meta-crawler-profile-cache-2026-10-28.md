# Meta collection and profile rendering costs — 2026-10-28

Authorized: restrict Meta collection only, improve caching, retain Google/AI search access, defer Pro payment.

Vercel baseline (dashboard Last 30 Days): CPU 4h36m/4h; origin transfer 10.59/10 GB; outbound CDN transfer 8.57/100 GB; function invocations 650,508. English project CPU 86%, Korean project 14%. English Last 12 hours: roughly 103K CDN requests, 86K identified as meta-externalagent. Detail 66K calls/17m CPU, search 17K/5m, feedback 11K/2m; all three had 0% cache hits. These request counts do not prove Meta's exact CPU share or human traffic growth.

English project firewall: added one enabled Deny rule matching User Agent Contains meta-externalagent; published after reviewing the sole change. Existing AI Bots Allow, Bot Protection Off, and all unrelated settings retained. Both lower/mixed case Meta test agents returned 403; Googlebot, OAI-SearchBot, PerplexityBot and facebookexternalhit returned 200. Synthetic agent probes verify rule matching, not authentic crawler identity or indexing outcomes.

Profile pages: on-demand ISR, one-hour revalidation, no bulk profile generation at build. Canonical, structured content and crawlable links retained. Query-dependent return navigation moves to a client link; search text and return URL never enter cached HTML. Exact verified legacy identities redirect before rendering, preserving queries. Redirect JSON mirrors existing identity records; test checks equality.

Profile refresh errors throw for ISR so stale good HTML is retained rather than cached as a false 404. Existing non-ISR callers keep their fallback behavior. True missing records retain 404. Search filters, GPS, APIs and existing restricted comparison data cache remain unchanged.

Validation: 105 tests and production build passed. Local production server showed MISS then HIT; query variant reused HIT with no private query in HTML; alias redirected 308 with returnTo preserved; missing profile returned 404; robots allow all except Meta collection, preserving both sitemaps. Production verification recorded separately in task outputs after rollout.

No subscription, billing, database schema, records, analytics IDs or global bot blocking changed. Existing exhausted quota is not reset by these changes; suspension remains possible while over quota.
