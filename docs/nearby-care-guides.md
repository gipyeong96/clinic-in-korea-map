# Nearby search and care guide proposal

Preview scope: add a Use my location entry beside home search; replace the repeated Goldman homepage cards with a care guide section; keep all five branch detail URLs and their visit guides. First guide: How to choose a urology clinic in Gangnam. Future cards should cover visiting a clinic and interpreting registry information, only after the articles exist.

Location is requested only after a button press. A POST body carries coordinates to the server and Supabase RPC; coordinates are not placed in URLs, browser storage, analytics events or application logs. The page uses in-memory state and starts fresh after reload. Nearby profile links contain no position. Hospital directions still link to external maps normally. Browser permission persistence is controlled by the browser. Infrastructure may process request bodies; this is not an assertion of zero retention by every platform.

Distance is straight-line. Radius is limited to 500m/1/2/5km; Korea coordinates only; reported department/specialist/registry filters run before pagination. No background tracking. Existing station RPCs and clinic records are untouched.

Goldman condition and equipment content is a network summary, not a branch inventory or treatment recommendation. Sources checked 2026-10-22: official English condition navigation, equipment page, medical team and care approach. No superiority, pain-free or outcome claims were copied. Guide disclosure names the consulting relationship; it is a navigation guide, not medically reviewed. Google ratings are deferred.
