# Saved clinics and visible search conditions

- My clinics stores up to 100 saved profiles and the latest 20 distinct viewed profiles in this browser's localStorage. It stores only clinic identifiers, clean detail links and public display details, not search terms or patient information. It is not account-synced. Users can unsave profiles or remove individual recent items. Existing saved profiles are not evicted when the saved limit is reached.
- Storage errors are reported on save/list actions. Reading malformed records skips invalid entries; external/script URLs cannot become library links. Viewing a clinic still works when storage is unavailable. No Supabase records change.
- Cards and detail pages have explicit save toggles. Detail visits populate recent items. Library data is a snapshot; the page tells users to open a profile for current details. The personalized library is noindex and excluded from sitemaps.
- Search conditions are shown as accessible links. Department, keyword and specialist removals retain remaining conditions and reset pagination. Removing a station also removes its radius, which has no meaning without the station. Radius offers Change, because station searches require a radius. Clear all filters is explicit.
- The existing header CTA destination is preserved and labeled Goldman Gangnam. My clinics is accessible from the header. Mobile view-toggle offset accounts for the header wrapping to two rows.

Validation: 37 regression tests, production build and TypeScript. Browser checks include save → detail → recently viewed, reload persistence, unsave/recent removal, active filter links and mobile layout. Preview storage is independent of production storage.
