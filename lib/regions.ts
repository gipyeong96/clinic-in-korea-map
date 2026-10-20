// Address constraints are applied before limiting results. Legacy location IDs may
// contain homonymous neighbourhoods merged by the original import.
// English names: https://english.gg.go.kr/31-si-gun-shortcut/ (checked 2026-10-20).
export const gyeonggiRegions = [
  ['uiwang','의왕시'],['suwon','수원시'],['seongnam','성남시'],['uijeongbu','의정부시'],
  ['anyang','안양시'],['bucheon','부천시'],['gwangmyeong','광명시'],['pyeongtaek','평택시'],
  ['dongducheon','동두천시'],['ansan','안산시'],['goyang','고양시'],['gwacheon','과천시'],
  ['guri','구리시'],['namyangju','남양주시'],['osan','오산시'],['siheung','시흥시'],
  ['gunpo','군포시'],['hanam','하남시'],['yongin','용인시'],['paju','파주시'],
  ['icheon','이천시'],['anseong','안성시'],['gimpo','김포시'],['hwaseong','화성시'],
  ['gyeonggi-gwangju','광주시'],['yangju','양주시'],['pocheon','포천시'],['yeoju','여주시'],
  ['yeoncheon','연천군'],['gapyeong','가평군'],['yangpyeong','양평군'],
];
export function extractRegion(input:string) {
  if(/\bstation\b|역(?:\s|$)/i.test(input))return null;
  const matches=gyeonggiRegions.map(([slug,ko])=>{
    const en=slug==='gyeonggi-gwangju'?'(?:gyeonggi(?:-do)?[ -]+gwangju|gwangju[ ,]+gyeonggi(?:-do)?)':`${slug}(?:[ -](?:si|gun)| city)?`;
    const korean=slug==='gyeonggi-gwangju'?'경기(?:도)?\\s*광주시?':`${ko.slice(0,-1)}(?:${ko.slice(-1)})?`;
    const pattern=new RegExp(`(?<![\\p{L}\\p{N}])(?:${en}|${korean})(?![\\p{L}\\p{N}])`,'iu');
    return {slug,pattern,match:input.match(pattern)};
  }).filter(x=>x.match);
  if(matches.length!==1)return null;
  const {slug,pattern}=matches[0];
  return {slug,query:input.replace(pattern,' ').replace(/(?:^|\s)gyeonggi(?:-do)?(?=\s|$)/ig,' ').replace(/(?:^|\s)경기도?(?=\s|$)/g,' ').trim().replace(/\s+/g,' ')};
}
export const regionAddresses: Record<string, string[]> = {
  ...Object.fromEntries(gyeonggiRegions.map(([slug,ko])=>[slug,[`경기도 ${ko} `,`경기 ${ko} `]])),
  gangnam: ['서울특별시 강남구 ', '서울 강남구 ', '서울특별시 서초구 ', '서울 서초구 '],
  seoul: ['서울특별시 ', '서울 '],
  busan: ['부산광역시 ', '부산 '],
  daegu: ['대구광역시 ', '대구 '],
  daejeon: ['대전광역시 ', '대전 '],
  gwangju: ['광주광역시 ', '광주 ', '전남광주통합특별시 '],
  ulsan: ['울산광역시 ', '울산 '],
  jeju: ['제주특별자치도 ', '제주도 ', '제주 '],
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
