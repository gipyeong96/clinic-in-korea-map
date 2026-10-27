# Clinic list read efficiency — 2026-10-27

- Keep list filters, ordering, pagination, canonical URLs and indexing policy unchanged.
- Select only card/map/save/weekend fields; retain inner category/location membership with smaller joined records. Detail and comparison API reads still retrieve complete profiles.
- Share detail metadata/body reads with React request memoization. Equivalent list arguments share a request-local read.
- Only the finite set of unfiltered first-page urology comparisons uses a 60-second public data cache. Concurrent cold reads share a promise within a server process. Search terms, filters, subsequent pages, other departments and GPS are excluded from persistent caching. Cache expiry refreshes public data; on refresh failure Next retains the last successful snapshot. This is directory data, not live appointment availability.
- Disable speculative detail-page prefetching on result cards; links remain crawlable and work on selection.
- Keep the installed SDK's existing transient transport retry behavior. Do not add retries for SQL 57014: repeating a 3-second timeout increases server work and time before content. A failed initial read throws, is not stored as a successful empty list, and releases the in-flight entry. Existing explicit Try again remains.

## Validation

103 tests passed; production build passed. Tests cover concurrent cold reads, request isolation, excluded filters, failure cleanup/no timeout retry, genuine empty results and detail read sharing.

Four sequential public API before/after comparisons retained the same IDs, ordering and all consumed card/map fields. These are uncompressed JSON response sizes, not browser transfer sizes. Single-pair elapsed times include network/cache variation and do not establish a production latency guarantee.

| Query | Rows incl. lookahead | Before bytes | After bytes | Reduction | Before/after elapsed ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| Guwol | 26 | 67109 | 48297 | 28% | 1445 / 853 |
| Guwol specialist | 7 | 14749 | 9605 | 35% | 2704 / 688 |
| Guwol page 2 | 5 | 10399 | 7347 | 29% | 1303 / 473 |
| Gangnam | 26 | 62597 | 43281 | 31% | 1173 / 518 |

Initial cache misses can still time out under database load. This change reduces avoidable work; it does not prove that all 57014 errors are eliminated. No schema, data, role, grant, timeout or PR62 changes.
