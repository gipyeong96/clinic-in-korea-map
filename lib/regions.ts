// Address constraints are applied before limiting results. Legacy location IDs may
// contain homonymous neighbourhoods merged by the original import.
export const regionAddresses: Record<string, string[]> = {
  gangnam: ['서울특별시 강남구 ', '서울 강남구 ', '서울특별시 서초구 ', '서울 서초구 '],
  seoul: ['서울특별시 ', '서울 '],
  incheon: ['인천광역시 ', '인천 '],
  jamsil: ['서울특별시 송파구 % (잠실', '서울 송파구 % (잠실'],
  dongtan: ['경기도 화성시 % (동탄', '경기도 화성시 동탄', '경기 화성시 동탄'],
};

export function addressFilter(prefixes: string[]) {
  return prefixes.map(prefix => `address_ko.like."${prefix}%"`).join(',');
}

export function locationIdsForSlug(rows: {id: number; slug: string; parent_id?: number}[], slug: string) {
  // Only exact, scoped identities can expand to descendants; never startsWith.
  const matches = rows.filter(row => row.slug === slug);
  const ids = new Set(matches.map(row => row.id));
  let changed = true;
  while (changed) {
    changed = false;
    for (const row of rows) {
      if (row.parent_id && ids.has(row.parent_id) && !ids.has(row.id)) {
        ids.add(row.id); changed = true;
      }
    }
  }
  return Array.from(ids);
}
