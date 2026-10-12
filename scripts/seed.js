require('dotenv').config({ path: '.env.local' });
const XLSX = require('xlsx');
const fs = require('fs');

// Helper to find file by partial name
function findFile(partial) {
  const files = fs.readdirSync('./data');
  return './data/' + files.find(f => f.includes(partial));
}

// 1. Target Departments (Urology: 15, Dentistry: 49~61, Internal Med: 01, Dermatology: 14, Plastic Surgery: 08)
const TARGET_DEPTS = {
  // Urology (비뇨의학과) -> 1
  '15': { id: 1, slug: 'urology' },

  // Dentistry (치과) -> 2
  '49': { id: 2, slug: 'dentistry' },
  '50': { id: 2, slug: 'dentistry' },
  '51': { id: 2, slug: 'dentistry' },
  '52': { id: 2, slug: 'dentistry' },
  '53': { id: 2, slug: 'dentistry' },
  '54': { id: 2, slug: 'dentistry' },
  '55': { id: 2, slug: 'dentistry' },
  '56': { id: 2, slug: 'dentistry' },
  '57': { id: 2, slug: 'dentistry' },
  '58': { id: 2, slug: 'dentistry' },
  '59': { id: 2, slug: 'dentistry' },
  '61': { id: 2, slug: 'dentistry' },

  // Internal Medicine (내과) -> 3
  '01': { id: 3, slug: 'internal-medicine' },

  // Dermatology (피부과) -> 4
  '14': { id: 4, slug: 'dermatology' },

  // Plastic Surgery (성형외과) -> 5
  '08': { id: 5, slug: 'plastic-surgery' }
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

function getPrimaryCategory(clinicName, deptList) {
  if (clinicName.includes('비뇨')) return 1;
  if (clinicName.includes('치과')) return 2;
  if (clinicName.includes('내과')) return 3;
  if (clinicName.includes('피부')) return 4;
  if (clinicName.includes('성형')) return 5;
  
  if (deptList && deptList.length > 0) {
    if (deptList.includes(1)) return 1;
    if (deptList.includes(4)) return 4;
    if (deptList.includes(5)) return 5;
    if (deptList.includes(2)) return 2;
    return deptList[0];
  }
  return 3;
}

async function main() {
  console.log("Loading files... this may take a minute.");
  
  // Load Departments
  const deptWb = XLSX.readFile(findFile('03_진료과목정보'));
  const deptData = XLSX.utils.sheet_to_json(deptWb.Sheets[deptWb.SheetNames[0]]);
  
  // Filter for our target departments
  const targetClinics = {};
  for (const row of deptData) {
    const code = String(row['진료과목코드']).padStart(2, '0');
    if (TARGET_DEPTS[code]) {
      const id = row['암호화요양기호'];
      if (!targetClinics[id]) {
        targetClinics[id] = { 
          departments: [], 
          has_specialist: false
        };
      }
      targetClinics[id].departments.push(TARGET_DEPTS[code].id);
      if (row['과목별 전문의수'] > 0) {
        targetClinics[id].has_specialist = true;
      }
    }
  }
  
  console.log(`Found ${Object.keys(targetClinics).length} target clinics with target specialties.`);

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

  // Load Equipment
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
  
  console.log("Merging data with accurate department classification...");
  const finalRecords = [];
  
  for (const row of baseData) {
    const id = row['암호화요양기호'];
    if (!targetClinics[id]) continue;
    
    const name = row['요양기관명'] || '';
    const category_id = getPrimaryCategory(name, targetClinics[id].departments);
    
    const excelDate = row['개설일자'];
    const isNew = excelDate > 44900; // approximate for 2023+
    
    finalRecords.push({
      hira_code: id,
      name_ko: name,
      category_id: category_id,
      
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

  console.log(`Generated ${finalRecords.length} clean clinic records.`);
  fs.writeFileSync('./data/merged_clinics.json', JSON.stringify(finalRecords, null, 2));
  console.log("Saved clean records to data/merged_clinics.json !");
}

main().catch(console.error);
