# Nationwide area search

Checked 2026-10-21. The catalog contains 17 province-level search groups and 267 city/county/district scopes, including 39 nested districts. Sejong is searched as a province-level group. Existing Gyeonggi route slugs remain valid.

## Sources and limits

- Government-operated Study in Korea regional directory: https://www.studyinkorea.go.kr/ko/life/regionsIntro.do . Municipality links are retained per catalog entry. Its list omits Yeonggwang and Jangseong; these were supplemented using the yearbook and existing HIRA address scopes.
- Bilingual administrative yearbook archived by CODIL: https://www.codil.or.kr/filebank/original/EC/OTKCEC240471/OTKCEC240471.pdf?stream=T . Tables reference 2016-12-31 and are used for bilingual spelling only, not current jurisdiction boundaries.
- Supplemental Romanized aliases cover newer names and nested districts; `nameSource` distinguishes these from yearbook spellings. The catalog is a search aid, not a certified current English administrative register. Individual official municipality URLs allow follow-up verification.
- Existing HIRA clinic addresses determine compatible address prefixes. Full/short and older province names are accepted. Source address text `전남광주통합특별시` is handled through municipality-specific prefixes: five Gwangju districts are separate from Jeonnam cities/counties. It does not establish a legal jurisdiction or merge the two search groups.

No clinic records or language-support claims are changed. Refresh the catalog when source jurisdiction names change; do not infer boundaries from English display names alone.

## Behavior

- `/areas` provides crawlable province/city/district links and a Korean/English search form. The homepage links to it; the sitemap includes the new area pages.
- Unique area aliases retain remaining keywords. Homonyms such as Goseong and Jung-gu require a province-qualified selection. Explicit station searches and existing Gangnam/Jamsil/Dongtan meanings are preserved.
- Successful zero-result queries offer explicit changes to one condition at a time. Errors offer retry instead of claiming no matches. Pagination can return to page one.

## Validation

- 30 search regression tests pass, including every catalog area's qualified Korean and English aliases, homonyms, Gwangju separation, and suggestion filter preservation.
- Production build and TypeScript pass.
- All 53,006 locally cached HIRA clinic addresses have a city/county/district prefix or Sejong province prefix in the catalog (read-only audit).
- Browser checks: ambiguous Goseong selection, actual Gangwon Goseong results, station zero results, radius expansion preserving other filters, clear-keyword recovery, and 320/390 px layouts without horizontal overflow.
