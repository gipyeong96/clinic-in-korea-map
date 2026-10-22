# Goldman Google Maps reviews pilot

Scope: only five existing Goldman profile IDs. No ratings, counts, authors, photos or review text are copied into Supabase, page HTML, structured data or browser storage. Place IDs can be retained. Google handles the rendered reviews, attribution and author/source links. No sentiment filtering or AI review summary is requested. The page offers an independent Google Maps link in all states.

## Identity checks — 22 October 2026

Place IDs were read from Google's public Place ID Finder. Each Maps listing was compared with the official branch's name, phone, website and address/location. Source: https://www.gold-man.com/ennew/support/location (branch tabs 2/3/5/7/6). No changes were made to Google Business Profiles.

| Profile | Place ID | Official contact used for comparison |
|---|---|---|
| Gangnam | ChIJhc2r2E-hfDURjLkDalcOpKU | 02-556-7533 · 12 Seoun-ro |
| Seoul Station | ChIJ4dTsm4qifDURH5rHtah--yg | 02-773-7522 · Changhwa Building, 23 Sejong-daero |
| Incheon | ChIJffomitl7ezURc8v62EO9nKU | 032-221-1911 · Ito Tower, 138 Yesul-ro |
| Dongtan | ChIJwStJkeNFezURXvhiklLTKZU | 031-373-7532 · Woosung Tower, 489 Dongtan-daero |
| Jamsil | ChIJb_GGHhylfDURVBg8h7-m-Ts | 02-421-7511 · Korea Advertising Culture Center, 137 Olympic-ro 35-gil |

Seoul Station and Incheon Maps listings use lot-number addresses. Jamsil's Maps address is awkwardly formatted. Preserve the official visit-guide addresses; do not overwrite them with Google's text. Place ID refresh is recommended after 12 months or if a branch moves.

## Runtime and access

The widget mounts only after Show Google ratings & reviews is clicked. The existing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is reused with the same Maps JS loader options as the results map; no second API key or loader is introduced. Request content selects address, rating, reviews and attribution. It uses basic gmp-place-details, not Advanced/Pro. No geolocation is passed. No per-clinic search request is issued at runtime because the Place IDs are preverified.

The current Google Cloud project already allows Maps JavaScript API and Places UI Kit. Existing website restriction is https://map.clinicinkorea.com/*. Preview configuration is separate; do not remove the production restriction or add a wildcard for all Vercel sites. Enable only the exact branch preview origin after authorization. Leave unrelated APIs and credentials unchanged. Missing key, script/widget errors, and a 20-second load timeout fall back to a direct Maps link. Budget alerts do not cap usage; review Cloud quotas and traffic before expanding beyond the pilot.

Official references checked 22 October 2026:
- https://developers.google.com/maps/documentation/javascript/places-ui-kit/place-details
- https://developers.google.com/maps/documentation/javascript/places-ui-kit/overview
- https://developers.google.com/maps/documentation/places/web-service/policies
- https://developers.google.com/maps/documentation/places/web-service/place-id
- https://developers.google.com/maps/billing-and-pricing/pricing

Public /privacy and /terms pages explain Google connections and link to Google policies. Existing hosting, analytics and browser storage are disclosed. Do not add Google review scores as our own review or AggregateRating schema.
