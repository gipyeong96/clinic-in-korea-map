require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const aromanize = require('aromanize');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BRAND_MAP = {
  '골드만': 'Goldman', '서울': 'Seoul', '연세': 'Yonsei', '고려': 'Korea',
  '가톨릭': 'Catholic', '카톨릭': 'Catholic', '삼성': 'Samsung', '아산': 'Asan',
  '강남': 'Gangnam', '신촌': 'Sinchon', '압구정': 'Apgujeong', '서초': 'Seocho',
  '송파': 'Songpa', '잠실': 'Jamsil', '마포': 'Mapo', '영등포': 'Yeongdeungpo',
  '종로': 'Jongno', '분당': 'Bundang', '일산': 'Ilsan', '수원': 'Suwon',
  '인천': 'Incheon', '부산': 'Busan', '대전': 'Daejeon', '대구': 'Daegu',
  '광주': 'Gwangju', '울산': 'Ulsan', '제주': 'Jeju', '드림': 'Dream',
  '플러스': 'Plus', '베스트': 'Best', '센트럴': 'Central', '탑': 'Top',
  '미소': 'Miso', '밝은': 'Bright', '바른': 'Barun', '맑은': 'Malgeun',
  '행복한': 'Happy', '사랑': 'Sarang', '우리': 'Woori', '하나': 'Hana',
  '굿모닝': 'Good Morning', '웰': 'Well', '스마트': 'Smart', '프라임': 'Prime',
  '리더스': 'Leaders', '스타': 'Star', '메디': 'Medi', '연합': 'United'
};

function formatEnglishName(koreanName, categoryId) {
  if (!koreanName) return '';
  let name = koreanName.trim();
  
  let deptSuffix = ' Clinic';
  if (name.includes('비뇨')) deptSuffix = ' Urology Clinic';
  else if (name.includes('치과')) deptSuffix = ' Dental Clinic';
  else if (name.includes('내과')) deptSuffix = ' Internal Medicine Clinic';
  else if (name.includes('피부')) deptSuffix = ' Dermatology Clinic';
  else if (name.includes('성형')) deptSuffix = ' Plastic Surgery Clinic';

  if (name.includes('병원') && !name.includes('의원')) {
    deptSuffix = deptSuffix.replace('Clinic', 'Hospital');
  }

  let core = name
    .replace(/(비뇨의학과|비뇨기과|피부과|성형외과|내과|치과|산부인과|정형외과|이비인후과|소아청소년과|소아과|안과|가정의학과)?(의원|병원|종합병원)$/, '')
    .trim();

  let translated = '';
  for (const [kr, en] of Object.entries(BRAND_MAP)) {
    if (core.startsWith(kr)) {
      translated += en + ' ';
      core = core.substring(kr.length).trim();
    }
  }
  if (core) {
    const roman = aromanize.romanize(core);
    translated += roman.charAt(0).toUpperCase() + roman.slice(1);
  }
  return (translated.trim() + deptSuffix).trim();
}

function toSlug(text) {
  if (!text) return '';
  let romanized = aromanize.romanize(text);
  return romanized.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  console.log("Loading merged clinics...");
  const data = JSON.parse(fs.readFileSync('./data/merged_clinics.json', 'utf8'));
  
  // 1. Build Location Tree
  console.log("Building Location Tree...");
  const sidos = new Set();
  const sigungus = new Map(); // sido -> Set of sigungus
  const dongs = new Map(); // sigungu -> Set of dongs

  for (const c of data) {
    if (!c.sido) continue;
    sidos.add(c.sido);
    
    if (!sigungus.has(c.sido)) sigungus.set(c.sido, new Set());
    if (c.sigungu) {
      sigungus.get(c.sido).add(c.sigungu);
      
      const key = `${c.sido}|${c.sigungu}`;
      if (!dongs.has(key)) dongs.set(key, new Set());
      if (c.dong) dongs.get(key).add(c.dong);
    }
  }

  const locationIds = {}; 

  // Insert SiDos
  console.log(`Inserting ${sidos.size} Si/Dos...`);
  for (const sido of sidos) {
    const { data: res, error } = await supabase.from('locations').upsert(
      { slug: toSlug(sido), name_ko: sido, name_en: aromanize.romanize(sido), name_mn: aromanize.romanize(sido), level: 'sido' },
      { onConflict: 'slug' }
    ).select().single();
    if (error) { console.error(error); continue; }
    locationIds[sido] = res.id;
  }

  // Insert SiGunGus
  console.log("Inserting Si/Gun/Gus...");
  for (const [sido, sgSet] of sigungus.entries()) {
    const parentId = locationIds[sido];
    for (const sg of sgSet) {
      const { data: res, error } = await supabase.from('locations').upsert(
        { slug: `${toSlug(sido)}--${toSlug(sg)}`, name_ko: sg, name_en: aromanize.romanize(sg), name_mn: aromanize.romanize(sg), level: 'sigungu', parent_id: parentId },
        { onConflict: 'slug' }
      ).select().single();
      if (!error) locationIds[`${sido}|${sg}`] = res.id;
    }
  }

  // Insert Dongs
  console.log("Inserting Dongs...");
  for (const [key, dongSet] of dongs.entries()) {
    const parentId = locationIds[key];
    for (const dong of dongSet) {
      const { data: res, error } = await supabase.from('locations').upsert(
        { slug: `${key.split('|').map(toSlug).join('--')}--${toSlug(dong)}`, name_ko: dong, name_en: aromanize.romanize(dong), name_mn: aromanize.romanize(dong), level: 'dong', parent_id: parentId },
        { onConflict: 'slug' }
      ).select().single();
      if (!error) locationIds[`${key}|${dong}`] = res.id;
    }
  }

  console.log("Locations ready. Uploading Clinics in batches of 1000...");
  
  const formattedClinics = data.map(c => {
    let locId = null;
    if (c.sido && c.sigungu && c.dong) {
      locId = locationIds[`${c.sido}|${c.sigungu}|${c.dong}`];
    }
    
    const enName = formatEnglishName(c.name_ko, c.category_id);
    
    return {
      hira_code: c.hira_code,
      name_ko: c.name_ko,
      name_en: enName,
      name_mn: enName,
      category_id: c.category_id,
      location_id: locId,
      telephone: c.telephone,
      address_ko: c.address_ko,
      latitude: c.latitude,
      longitude: c.longitude,
      has_specialist: c.has_specialist,
      newly_opened: c.newly_opened,
      public_facilities: c.public_facilities,
      public_equipment: c.public_equipment,
      is_premium: false
    };
  });

  if (formattedClinics.some(c => !c.location_id)) {
    throw new Error('Missing scoped location: refusing to assign clinics to an unrelated default location');
  }

  const BATCH_SIZE = 1000;
  for (let i = 0; i < formattedClinics.length; i += BATCH_SIZE) {
    const batch = formattedClinics.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('clinics').upsert(batch, { onConflict: 'hira_code' });
    if (error) {
      console.error(`Error inserting batch ${i}:`, error.message);
    } else {
      console.log(`Inserted clinics ${i} to ${i + batch.length}`);
    }
  }

  console.log("🎉 All data successfully updated in Supabase with correct departments and readable English names!");
}

main().catch(console.error);
