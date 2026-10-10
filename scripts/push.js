require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const aromanize = require('aromanize');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function toSlug(text) {
  if (!text) return '';
  // Basic romanization and clean up
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

  // To store DB IDs
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
        { slug: toSlug(sg), name_ko: sg, name_en: aromanize.romanize(sg), name_mn: aromanize.romanize(sg), level: 'sigungu', parent_id: parentId },
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
        { slug: toSlug(dong), name_ko: dong, name_en: aromanize.romanize(dong), name_mn: aromanize.romanize(dong), level: 'dong', parent_id: parentId },
        { onConflict: 'slug' }
      ).select().single();
      if (!error) locationIds[`${key}|${dong}`] = res.id;
    }
  }

  console.log("Locations inserted. Uploading Clinics in batches of 1000...");
  
  const formattedClinics = data.map(c => {
    let locId = null;
    if (c.sido && c.sigungu && c.dong) {
      locId = locationIds[`${c.sido}|${c.sigungu}|${c.dong}`];
    }
    
    return {
      hira_code: c.hira_code,
      name_ko: c.name_ko,
      name_en: aromanize.romanize(c.name_ko),
      name_mn: aromanize.romanize(c.name_ko),
      category_id: c.category_id,
      location_id: locId || 1, // Fallback to 1 if mapping fails
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

  console.log("🎉 All data successfully uploaded to Supabase!");
}

main().catch(console.error);
