# Search and profile clarity — 2026-10-28

- Replace Premium Certified/Verified badges with Partner clinic and visible commercial-relationship disclosure. Directory identities, specialists, registration, partner status and underlying records are unchanged.
- Search options show the current summary at every screen size and expand on request. Existing forms remain mounted with their values and deep-link reveal behavior.
- Profiles put contact actions immediately after address. Introduction, reported care/hours, partner guides/reviews and the evidence table use native disclosures. Content and source links remain in HTML; schema and canonical URLs are unchanged.
- Nearby profile links carry only /nearby?resume=1 and a validated card anchor. Options, position, results and selected card remain in tab memory for a one-use return within 15 minutes. No session/local storage or new analytics payload. Reload, new tab or expiry requires location permission again.
- Nearby requests abort after 20 seconds. Retry retains options; cancellation ignores stale results. Failure stays distinct from zero matches. This is browser recovery, not a fix for server timeout causes.
- Validation: 111 tests and typecheck. Background local UI fixture with synthetic coordinates/data verified page 2 → detail → page 2 with dentistry/location retained, 20-second timeout, retry → page 3 success. No real location or GA test hits. 390×844 mobile viewport simulation showed no horizontal overflow with evidence expanded. Test fixture removed before publishing.
