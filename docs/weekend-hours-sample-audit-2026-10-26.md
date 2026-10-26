# Official weekend-hours sample audit — 2026-10-26

Read-only validation for English Clinic Map. No production data, account settings or website changes.

## Source and method

- NMC nationwide hospital/clinic finder: https://www.data.go.kr/data/15000736/openapi.do
- Approved development account inspected; list and detail operations each show 1,000 daily requests. Existing application describes the Korean project; it was not edited. Confirm production usage arrangements before deployment.
- Reused the existing 40-clinic pilot: 20 Gangnam-gu/Seocho-gu and 20 Jamsil-dong/Sincheon-dong from the June 2026 HIRA snapshot. Not a representative nationwide sample.
- 40 name/district list calls, then 36 detail calls. Name + road address must match uniquely; detail HPID/name/address rechecked. Snapshot phone independently corroborated.
- Fetch date is not the provider's last schedule-update date. No per-record schedule reference period was found in these responses.

## Results

- Identity results: {'name_road_matched': 36, 'unmatched': 4}
- Phone corroboration: {'match': 36, 'not_matched': 4}
- Eligible for a reviewed prototype: 36
- Schedule results among those records: {'saturday': {'reported_schedule': 33, 'not_reported': 3}, 'sunday': {'not_reported': 33, 'reported_schedule': 3}, 'holiday': {'not_reported': 33, 'reported_schedule': 3}}

## Display rules

- Use “Saturday hours” / “Sunday hours” with “Reported schedule”, source and checked date, and a Call clinic action.
- Empty fields mean “Hours not provided”, not closed. Partial, invalid, equal or overnight time ranges require review; do not show as normal hours.
- This source does not establish live availability, walk-in acceptance, emergency capacity, lunch/registration cutoffs or exceptional closures. Do not label “Open now”.
- Keep the home simple. First add a small hours section to verified clinic details, then optional weekend filters in results once coverage improves.
- Exclude uncertain institution matches from public display. Jamsil here means two named dongs, not a station radius.

## Clinic-level evidence

| Clinic | Area | Identity | Phone | Saturday | Sunday |
|---|---|---|---|---|---|
| 닥터나가정의학과의원 | gangnam_area | name_road_matched | match | 09:30–14:00 | not_reported |
| 셀피아의료생활협동조합셀피아의원 | gangnam_area | name_road_matched | match | not_reported | not_reported |
| 스마트정형외과의원 | gangnam_area | name_road_matched | match | 09:00–13:00 | not_reported |
| 이정훈의원 | gangnam_area | name_road_matched | match | 09:30–14:00 | not_reported |
| 더뷰티성형외과의원 | gangnam_area | name_road_matched | match | 10:00–18:00 | not_reported |
| 에이퀸산부인과의원 | gangnam_area | name_road_matched | match | 09:00–13:00 | not_reported |
| 리메이크강남의원 | gangnam_area | name_road_matched | match | 10:00–15:00 | not_reported |
| 대치성모여성의원 | gangnam_area | name_road_matched | match | 10:00–14:00 | not_reported |
| 웰빙의원 | gangnam_area | name_road_matched | match | not_reported | not_reported |
| 강남푸른정형외과의원 | gangnam_area | name_road_matched | match | 09:00–13:00 | not_reported |
| 앤퍼센트의원 | gangnam_area | name_road_matched | match | 10:00–16:00 | not_reported |
| 닥터핏의원 | gangnam_area | unmatched | — | not linked | not linked |
| 이고의원 | gangnam_area | name_road_matched | match | 10:00–17:00 | 10:00–17:00 |
| 압구정탑라인의원 | gangnam_area | name_road_matched | match | 10:00–19:00 | not_reported |
| 알앤우드성형외과의원 | gangnam_area | name_road_matched | match | 10:00–13:00 | not_reported |
| 청담지움성형외과의원 | gangnam_area | name_road_matched | match | 10:00–15:30 | not_reported |
| 연세봄이비인후과의원 | gangnam_area | name_road_matched | match | 09:00–14:00 | not_reported |
| 라메종피부과의원 | gangnam_area | unmatched | — | not linked | not linked |
| 클리브성형외과의원 | gangnam_area | name_road_matched | match | 10:00–17:00 | not_reported |
| 대암의원 | gangnam_area | name_road_matched | match | not_reported | not_reported |
| 잠실진단검사의학과의원 | jamsil_area | unmatched | — | not linked | not linked |
| 잠실아산비뇨의학과의원 | jamsil_area | name_road_matched | match | 09:00–16:00 | not_reported |
| 잠실삼성365의원 | jamsil_area | name_road_matched | match | 09:00–21:00 | 09:00–21:00 |
| 산비오의원 | jamsil_area | name_road_matched | match | 09:30–14:00 | not_reported |
| 사랑아이여성의원 | jamsil_area | name_road_matched | match | 08:30–12:30 | not_reported |
| 베스탑비뇨기과의원 | jamsil_area | name_road_matched | match | 10:00–15:00 | not_reported |
| 골드만비뇨의학과의원 | jamsil_area | name_road_matched | match | 09:00–15:00 | not_reported |
| 아이엠유의원 | jamsil_area | unmatched | — | not linked | not linked |
| 서울삼성내과의원 | jamsil_area | name_road_matched | match | 09:00–13:00 | not_reported |
| 잠실연세우노비뇨기과의원 | jamsil_area | name_road_matched | match | 10:00–14:00 | 09:00–17:00 |
| 키앤키즈의원 | jamsil_area | name_road_matched | match | 10:00–17:00 | not_reported |
| 내일의원 | jamsil_area | name_road_matched | match | 09:30–13:00 | not_reported |
| 피아프의원 | jamsil_area | name_road_matched | match | 10:30–16:30 | not_reported |
| 서울드림이비인후과의원 | jamsil_area | name_road_matched | match | 09:30–13:30 | not_reported |
| 센스피부과의원 | jamsil_area | name_road_matched | match | 09:30–15:00 | not_reported |
| 정담이비인후과의원 | jamsil_area | name_road_matched | match | 09:00–14:00 | not_reported |
| 제트이비인후과의원 | jamsil_area | name_road_matched | match | 09:00–13:10 | not_reported |
| 잠실유외과의원 | jamsil_area | name_road_matched | match | 09:00–14:00 | not_reported |
| 잠실온피부과의원 | jamsil_area | name_road_matched | match | 10:00–16:00 | not_reported |
| 뉴리즈의원 | jamsil_area | name_road_matched | match | 10:00–15:00 | not_reported |
