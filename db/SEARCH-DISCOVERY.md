# Search discovery improvements

The station finder renders only its first 100 matches. `/stations` and 12 statically rendered `/stations/[region]` pages now provide normal HTML links to every station search page without requiring JavaScript interaction. Station page titles include the region/network to distinguish same-name stations. The homepage title and description describe the directory's actual scope instead of implying verified English service at every clinic.

`/sitemap.xml` retains station/core content and adds the station directories. `/clinic-sitemaps.xml` is a root-level sitemap index for all public database clinic detail pages, using the existing `clinicPath` canonical URL helper. Root-level `/clinic-sitemap-N.xml` URLs rewrite to the XML handler. Pages contain at most 1,000 URLs to respect the database API row cap. Ordering by unique clinic ID prevents overlap between ranges. XML URLs are escaped. Database failures return 503 rather than a successful empty sitemap; invalid or empty page numbers return 404. Successful XML responses have a one-hour shared cache. No guessed modification dates are emitted.

Robots advertises both sitemap files. Existing query/filter URLs remain noindex and retain the unfiltered canonical. Database source evidence, English support claims and clinic records are unchanged.

## Checks on 2026-10-19

- Production build and 17 regression tests passed.
- Actual HTTP audit of the local production server found 54 clinic sitemap parts, 53,006 unique clinic URLs, all 12 region directories and all 1,127 station links.
- Google Search Console: existing sitemap was last read on 2026-10-18 and reported 42 discovered pages. The current production sitemap has 1,214 URLs including 1,127 station URLs; resubmission was accepted on 2026-10-19. This was the pre-change production sitemap, not the new clinic sitemap index.
- Google URL inspection reports the production homepage is already indexed. A fresh indexing request was accepted and the homepage was added to the priority crawl queue. Aggregate page-indexing report is still processing, so no total indexed-page count is claimed.
- New directory routes and clinic sitemap index require deployment before submitting the additional index in Search Console. Naver submission has not been performed.

References: [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), [Naver robots and sitemap discovery](https://searchadvisor.naver.com/guide/seo-basic-robots). Sitemap submission aids discovery but does not guarantee indexing, ranking or a completion date.
