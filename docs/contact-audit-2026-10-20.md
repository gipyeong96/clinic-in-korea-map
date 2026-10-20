# Contact data and mobile visit flow audit

Read-only audit of 53,006 public clinic records on 2026-10-20 (KST).
No source records were rewritten and no missing area codes were inferred.

| Telephone format | Records | UI behavior |
| --- | ---: | --- |
| Recognized Korean full number or service number | 50,524 | Call link |
| Local number without an area code | 2,121 | Display original number and request confirmation |
| Empty or non-numeric placeholder | 337 | Number not provided |
| Other incomplete/unrecognized format | 24 | Display original number and request confirmation |

Format recognition does not establish that a telephone number is active or that
English assistance is available. All 53,006 records have populated English-name
and Korean-address fields; this is a completeness check, not a verification of
official English naming, translation quality, or current clinic operations.
No telephone field contained Latin/Korean text. The apparent equipment text
beside a telephone number was adjacent card content, now separated semantically.

## Visit flow changes

- Call and directions actions in cards and clinic detail; copy source Korean
  address on detail, with success/failure feedback.
- Real coordinates are used for directions when present; the exact source
  address is used otherwise. The known import placeholder coordinate is excluded.
- Mobile list/map switch with natural document scrolling; desktop keeps the
  side-by-side layout and scrollable result list.
- Maps without a configured Google key or with a script load failure use an
  attributed OpenStreetMap embed. This fallback marks the selected clinic only.
- Long names, badges, and detail tables wrap on narrow screens.

## Validation

- 21 automated contact, search, registry and sitemap checks passed.
- Production build passed.
- Browser checks: Busan Seomyeon list → selected map → detail; call/directions
  destinations; address-copy feedback; Daegu Banwoldang keyword search.
- At 390px the mobile result list has no nested overflow scrolling; at 320px
  the detail view has no horizontal document overflow after badge wrapping.

The Google call link and external directions URL were inspected without placing
a call. Public-source telephone corrections require separate source confirmation.
