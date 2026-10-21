# Address-based clinic regions and search return

Clinic cards, detail breadcrumbs and detail metadata now derive region labels from province-qualified Korean source-address prefixes in the existing national catalog. The longest matching prefix wins, so nested districts take precedence over their parent city/province. Ambiguous legacy `locations` relationships are not used as fallback. If an address is unrecognized, the card omits the region and detail navigation offers all areas.

The existing source addresses, clinic IDs, relationships and premium data remain unchanged. Region resolution runs on the server; the full catalog is not added to card client code.

Search result name links, View Details links and map detail links carry an explicit local return destination. It retains department, region/station, keyword, specialist, radius and page, plus an anchor to the selected clinic card. Detail pages opened directly offer Browse clinics in this area. Returning does not restore a manually panned map or the map/list toggle.

Return destinations allow only local search-page paths and the four supported query parameters, with validation for duplicate/malformed parameters, external URLs and card anchors. Detail canonicals and ItemList URLs remain the existing clean detail URLs.

Validation: 33 regression tests pass; production build and TypeScript pass. Browser checks cover Gwangju page two → detail → page two/card, correct province-qualified breadcrumb, and Seoul Station dentistry with a Korean keyword, specialist filter, 2km radius and page two. Mobile detail layout at 390px has no horizontal overflow; canonical excludes return context. No database migration required.
