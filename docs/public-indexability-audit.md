# Public indexability checks

Use `python3 scripts/check-indexability.py` before and after a proposed crawler-facing change. This manual, read-only audit checks a fixed set of public endpoints: homepage, robots, main sitemap, clinic sitemap index, one clinic sitemap shard, and two directory pages. It checks response status, expected content type, sitemap XML, duplicate entries within each sampled document, canonical markup, index-blocking directives, and a server-rendered heading. It never requests indexing, modifies settings, runs analytics, or queries Search Console.

Run offline regression tests with:

```
python3 -m unittest discover -s tests -p 'indexability_audit_test.py'
```

## Scope and limits

A pass means only these HTTP samples passed at that moment. It does **not** prove Google indexed a URL, that Googlebot received the same historical response, that every sitemap shard is valid, that directory data is complete, or that content meets search quality criteria. Current sitemap availability does not disprove a previous processing error. No recovery or penalty conclusion should be made from this script.

Use private Search Console evidence to compare indexed/excluded cohorts and representative URLs, then inspect the matching deployed commit and rendered content. Keep search analytics and exports outside this public repository. Do not roll back, change canonical/noindex rules broadly, remove pages, or submit large batches merely because this check passes or fails.

The current audit is manual and not wired into scheduled Actions. It needs only Python's standard library; no secret or service subscription.
