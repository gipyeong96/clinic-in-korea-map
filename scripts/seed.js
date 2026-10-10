require('dotenv').config({ path: '.env.local' });
const XLSX = require('xlsx');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // fallback to anon if service key missing
);

// Helper to find file by partial name
function findFile(partial) {
  const files = fs.readdirSync('./data');
  return './data/' + files.find(f => f.includes(partial));
}

// 1. Target Departments (Urology, Dentistry, Internal Med, Dermatology, Plastic Surgery)
const TARGET_DEPTS = {
  '01': { id: 3, slug: 'internal-medicine' },
  '11': { id: 1, slug: 'urology' },
  '14': { id: 4, slug: 'dermatology' },
  '49': { id: 2, slug: 'dentistry' },
  '50': { id: 2, slug: 'dentistry' }, // 치과병원
  '54': { id: 2, slug: 'dentistry' }, // 치과보철과 등
  '13': { id: 5, slug: 'plastic-surgery' }
};

// Map all 12 public equipments to English
const EQ_MAP = {
  '체외충격파쇄석기': 'ESWL (Stone Crusher)',
  'MRI': 'MRI',
  '전산화단층촬영장치(CT)': 'CT',
  '초음파영상진단기': 'Ultrasound',
  '유방촬영장치': 'Mammography',
  '콘빔CT': 'Cone Beam CT',
  '골밀도검사기': 'Bone Densitometry',
  '혈액투석을위한인공신장기': 'Hemodialysis Machine',
  '양전자단층촬영기 (PET)': 'PET Scan',
  '종양치료기 (Gamma Knife)': 'Gamma Knife',
  '종양치료기 (Cyber Knife)': 'Cyber Knife',
  '종양치료기 (양성자치료기)': 'Proton Therapy'
};

async function main() {
  console.log("Loading files... this may take a minute.");
  
  // Load Departments
  const deptWb = XLSX.readFile(findFile('03_진료과목정보'));
  const deptData = XLSX.utils.sheet_to_json(deptWb.Sheets[deptWb.SheetNames[0]]);
  
  // Filter for our target departments to reduce memory footprint
  const targetClinics = {};
  for (const row of deptData) {
    const code = String(row['진료과목코드']).padStart(2, '0');
    if (TARGET_DEPTS[code]) {
      if (!targetClinics[row['암호화요양기호']]) {
        targetClinics[row['암호화요양기호']] = { 
          departments: [], 
          has_specialist: false
        };
      }
      targetClinics[row['암호화요양기호']].departments.push(TARGET_DEPTS[code].id);
      if (row['과목별 전문의수'] > 0) {
        targetClinics[row['암호화요양기호']].has_specialist = true;
      }
    }
  }
  
  console.log(`Found ${Object.keys(targetClinics).length} target clinics (Urology, Dentistry, etc).`);

  // Load Base Info
  const baseWb = XLSX.readFile(findFile('1.병원정보서비스'));
  const baseData = XLSX.utils.sheet_to_json(baseWb.Sheets[baseWb.SheetNames[0]]);
  
  // Load Facilities
  const facWb = XLSX.readFile(findFile('01_시설정보'));
  const facData = XLSX.utils.sheet_to_json(facWb.Sheets[facWb.SheetNames[0]]);
  const facMap = {};
  for (const row of facData) {
    if (targetClinics[row['암호화요양기호']]) {
      facMap[row['암호화요양기호']] = {
        inpatient_beds: (row['일반입원실일반병상수'] || 0) + (row['일반입원실상급병상수'] || 0),
        surgery_rooms: row['수술실병상수'] || 0
      };
    }
  }

  const eqWb = XLSX.readFile(findFile('05_의료장비정보'));
  const eqData = XLSX.utils.sheet_to_json(eqWb.Sheets[eqWb.SheetNames[0]]);
  const eqMap = {};
  for (const row of eqData) {
    if (targetClinics[row['암호화요양기호']]) {
      const eqName = row['장비코드명'];
      if (!eqMap[row['암호화요양기호']]) eqMap[row['암호화요양기호']] = new Set();
      eqMap[row['암호화요양기호']].add(EQ_MAP[eqName] || eqName);
    }
  }
  
  console.log("Merging data...");
  const finalRecords = [];
  
  for (const row of baseData) {
    const id = row['암호화요양기호'];
    if (!targetClinics[id]) continue;
    
    // Check if newly opened (within 2 years) - approximate using excel date
    // Excel date 45000 is approx 2023. Let's just flag manually or skip for now if too complex.
    // 41641 = ~2014. 
    const excelDate = row['개설일자'];
    const isNew = excelDate > 44900; // rough approx for 2023+
    
    // Location Mapping
    // To match our schema: we need to link to location_id. 
    // For MVP, let's just insert standard records. We will need to map SiGunGu to location_id properly later.
    // Right now, let's just create a raw table or insert into clinics directly if we mapped locations.
    // Since locations table only has 8 locations right now, we will just default to 1 (Seoul) and update locations later.
    
    // We will pick the FIRST target department for category_id
    const category_id = targetClinics[id].departments[0];
    
    finalRecords.push({
      hira_code: id,
      name_ko: row['요양기관명'],
      name_en: row['요양기관명'], // Translate later
      name_mn: row['요양기관명'], // Translate later
      category_id: category_id,
      
      // Raw location data for building the locations table
      sido: row['시도코드명'],
      sigungu: row['시군구코드명'],
      dong: row['읍면동'],
      
      telephone: row['전화번호'],
      address_ko: row['주소'],
      latitude: row['좌표(Y)'] || 37.5665,
      longitude: row['좌표(X)'] || 126.9780,
      has_specialist: targetClinics[id].has_specialist,
      newly_opened: isNew,
      public_facilities: facMap[id] || {},
      public_equipment: Array.from(eqMap[id] || [])
    });
  }

  console.log(`Generated ${finalRecords.length} records to insert.`);
  
  // Write to a JSON file for safety instead of inserting directly, so we can review
  fs.writeFileSync('./data/merged_clinics.json', JSON.stringify(finalRecords, null, 2));
  console.log("Saved preview to data/merged_clinics.json ! Check it out.");
}

main().catch(console.error);
