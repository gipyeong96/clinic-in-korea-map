# Clinic registry and departments

Source: HIRA, 전국 병의원 및 약국 현황 2026.6, `https://opendata.hira.or.kr/op/opc/selectOpenData.do?sno=11925`. Source encrypted institution identifiers are joined exactly (MD5 is only a compact join key, not identity inference). Read-only source workbooks belong under ignored `data/hira/`.

1. Run `scripts/prepare-departments.py` to prepare the department catalogue and 2,500-record staging batches. Load `db/registry-departments.sql`, the generated catalogue, then batches from `data/department-batches/` as owner/admin. Staging tables have RLS and no public read policy.
2. Run `db/apply-registry-departments.sql`. It backs up existing classifications, stores each reported department and its own specialist count, and assigns a separate directory focus. Focus uses institution type, an explicit name corroborated by the reported list, a sole reported/specialist department, or an unclassified multi-specialty label. It is not presented as an officially certified primary specialty.
3. Apply the `nearby_clinics` function from `db/official-data.sql`. Both area and station department searches must filter the reported department JSON, not the directory focus; specialist filtering must use the same selected department.

Registry source: KHIDI, `https://www.data.go.kr/data/3050000/fileData.do`, 2026-07-21. Provider entries are matched using whitespace-normalized exact name, province and institution type. A clinic must have one candidate and the source row must correspond to one normalized full address. Ambiguous branches are left in the private review table. Records store provider, source date, source name, match method and checked date. Registration does not create a language-support field. Curated premium data remains separate.

Legacy `scripts/push.js` is disabled to prevent overwriting per-department evidence with old priority-derived categories. Refresh the evidence pipeline rather than bulk-overwriting corrected profiles. Validate with `node --test tests/search.test.cjs`, `node tests/live-evidence.cjs`, and `node tests/live-geography.cjs`.
