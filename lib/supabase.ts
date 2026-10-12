import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lgbiyvqwurtlqsfsdnyy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_gw_11u4mkJiC-NvZPxUbOw_7AnTbO7s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const mockClinics: any[] = [
  {
    id: "goldman-gangnam",
    name_ko: "골드만비뇨의학과의원 강남점",
    name_en: "Goldman Urology Clinic Gangnam",
    name_mn: "Голдман Бөөр, Шээсний замын эмнэлэг Гангнам салбар",
    category: { slug: "urology", name_en: "Urology", name_mn: "Бөөрний булчирхай" },
    location: { slug: "gangnam", name_en: "Gangnam", name_mn: "Гангнам" },
    telephone: "02-556-7533",
    address_ko: "서울 서초구 서운로 12, 2층",
    address_en: "2F, 12, Seoun-ro, Seocho-gu, Seoul, Republic of Korea",
    address_mn: "БНСУ, Сөүл хот, Сочо-гү, Соүн-ру 12, 2 давхар",
    latitude: 37.485053,
    longitude: 127.029858,
    is_premium: true,
    premium_data: {
      slogan_en: "Over 25 years of experience, 2 million+ clinical cases. Trusted Urology.",
      slogan_mn: "25 гаруй жилийн туршлага, 2 сая гаруй клиник тохиолдол. Итгэлт бөөр шээсний замын эмнэлэг.",
      website: "https://www.gold-man.com",
      map_link: "https://maps.app.goo.gl/DugsPrz3a82QxBw36",
      booking_link: "https://www.gold-man.com",
      languages: ["Korean", "English", "Mongolian", "Chinese"],
      doctors: [
        { name_en: "Dr. Jo Chang-geun", role_en: "Representative Director / Urology specialist" },
        { name_en: "Dr. Ryu Kyeong-ho", role_en: "Director / Urology specialist" }
      ],
      specialties: [
        "Prostate diseases (BPH, Prostatitis)",
        "STD & Sexual Health",
        "Urinary tract stones (24h emergency lithotripsy)",
        "Da Vinci SP Robot Surgery"
      ]
    },
    opening_hours: {
      weekday: "09:00 - 18:00",
      saturday: "09:00 - 16:00",
      sunday: "Closed"
    }
  },
  {
    id: "goldman-seoulyeok",
    name_ko: "골드만비뇨의학과의원 서울역점",
    name_en: "Goldman Urology Clinic Seoul Station",
    name_mn: "Голдман Бөөр, Шээсний замын эмнэлэг Сөүл өртөө салбар",
    category: { slug: "urology", name_en: "Urology", name_mn: "Бөөрний булчирхай" },
    location: { slug: "seoul-station", name_en: "Seoul Station", name_mn: "Сөүл өртөө" },
    telephone: "02-773-7522",
    address_ko: "서울 중구 세종대로 23",
    address_en: "23, Sejong-daero, Jung-gu, Seoul, Republic of Korea",
    address_mn: "БНСУ, Сөүл хот, Жүн-гү, Сэжон-дэро 23",
    latitude: 37.55909,
    longitude: 126.973844,
    is_premium: true,
    premium_data: {
      slogan_en: "Easy access right next to Seoul Station. Multi-language friendly urological care.",
      slogan_mn: "Сөүл өртөөний хажууд хялбар байршил. Олон хэлээр бөөр шээсний замын тусламж үйлчилгээ.",
      website: "https://www.gold-man.com",
      map_link: "https://maps.app.goo.gl/cdqDgDGurZEqX5EA8",
      booking_link: "https://www.gold-man.com",
      languages: ["Korean", "English", "Japanese"],
      doctors: [
        { name_en: "Dr. Min Seung-gi", role_en: "Director / Urology specialist" }
      ],
      specialties: [
        "Prostate BPH (Holep, Rezum, Aquablation)",
        "Female Urology",
        "STD & Premature Ejaculation"
      ]
    },
    opening_hours: {
      weekday: "09:00 - 18:00",
      saturday: "09:00 - 16:00",
      sunday: "Closed"
    }
  },
  {
    id: "goldman-incheon",
    name_ko: "골드만비뇨의학과의원 인천점",
    name_en: "Goldman Urology Clinic Incheon",
    name_mn: "Голдман Бөөр, Шээсний замын эмнэлэг Инчон салбар",
    category: { slug: "urology", name_en: "Urology", name_mn: "Бөөрний булчирхай" },
    location: { slug: "incheon", name_en: "Incheon", name_mn: "Инчон" },
    telephone: "032-221-1911",
    address_ko: "인천 남동구 예술로 138",
    address_en: "138, Yesul-ro, Namdong-gu, Incheon, Republic of Korea",
    address_mn: "БНСУ, Инчон хот, Намдун-гү, Есүл-ру 138",
    latitude: 37.446241,
    longitude: 126.701006,
    is_premium: true,
    premium_data: {
      slogan_en: "Highest standard urology in Incheon area. Rapid response care.",
      slogan_mn: "Инчон бүсийн хамгийн өндөр стандартын бөөр шээсний замын эмнэлэг.",
      website: "https://www.gold-man.com",
      map_link: "https://maps.app.goo.gl/py7jE2dCYFE2sVLF7",
      booking_link: "https://www.gold-man.com",
      languages: ["Korean", "English"],
      doctors: [
        { name_en: "Dr. Kim Tae-heon", role_en: "Director / Urology specialist" }
      ],
      specialties: [
        "Urethritis & UTI",
        "Urinary Stones",
        "Male Infertility"
      ]
    },
    opening_hours: {
      weekday: "09:00 - 18:00",
      saturday: "09:00 - 16:00",
      sunday: "Closed"
    }
  }
];

export async function getClinics(params?: { categorySlug?: string, locationSlug?: string, limit?: number }) {
  let locationIds: number[] = [];
  
  if (params?.locationSlug && params.locationSlug !== 'all') {
    const cleanSlug = params.locationSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
    const { data: matchedLocs } = await supabase
      .from('locations')
      .select('id, parent_id, slug');
      
    if (matchedLocs && matchedLocs.length > 0) {
      const directMatches = matchedLocs.filter(l => 
        l.slug === params.locationSlug || 
        l.slug?.replace(/[^a-z0-9]/g, '') === cleanSlug ||
        l.slug?.startsWith(cleanSlug)
      );
      const matchIds = new Set(directMatches.map(l => l.id));
      
      matchedLocs.forEach(l => {
        if (l.parent_id && matchIds.has(l.parent_id)) {
          matchIds.add(l.id);
        }
      });
      locationIds = Array.from(matchIds);
    }
  }

  let query = supabase.from('clinics').select('*, categories!inner(*), locations!inner(*)');
  
  if (params?.categorySlug && params.categorySlug !== 'all') {
    query = query.eq('categories.slug', params.categorySlug);
  }
  
  if (locationIds.length > 0) {
    query = query.in('location_id', locationIds);
  } else if (params?.locationSlug && params.locationSlug !== 'all') {
    query = query.eq('locations.slug', params.locationSlug);
  }
  
  // Always bring premium first, then other clinics
  query = query.order('is_premium', { ascending: false }).limit(params?.limit || 100);
  
  const { data, error } = await query;
  if (error) {
    console.error('Supabase getClinics error:', error);
    return [];
  }
  return data || [];
}

export async function getClinicById(id: string) {
  // Check mock clinics first for custom slugs
  const mockMatch = mockClinics.find(c => c.id === id);
  if (mockMatch) return mockMatch;

  let query = supabase.from('clinics').select('*, categories(*), locations(*)');
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUUID) {
    query = query.eq('id', id);
  } else {
    query = query.eq('hira_code', id);
  }
  const { data, error } = await query.single();
  if (error) {
    console.error('Supabase getClinicById error:', error);
    return null;
  }
  return data;
}
