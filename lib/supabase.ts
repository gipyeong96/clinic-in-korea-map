import { createClient } from '@supabase/supabase-js';
import { searchTerms } from './search';
import { regionAddresses, addressFilter, locationIdsForSlug } from './regions';
import { stationForSlug } from './stations';

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

export async function getClinics(params?: { categorySlug?: string, locationSlug?: string, limit?: number, query?: string, specialist?: boolean, radius?: number }) {
  if (params?.query?.trim() && searchTerms(params.query).length === 0) return [];
  const station = stationForSlug(params?.locationSlug || '');
  if (station) {
    const { data, error } = await supabase.rpc('nearby_clinics', {
      station_ids: station.stations.map(s => s.id), radius_m: params?.radius || 1000,
      category_slug: params?.categorySlug || 'all', search_query: searchTerms(params?.query || '').join(' '),
      specialist_only: params?.specialist || false, result_limit: params?.limit || 100,
    });
    if (error) throw new Error('Unable to load clinics near this station');
    return (data || []).map((clinic: any) => ({ ...clinic, station_name: station.name_en }));
  }
  let locationIds: number[] = [];
  
  const addressPrefixes = regionAddresses[params?.locationSlug || ''];
  if (params?.locationSlug && params.locationSlug !== 'all' && !addressPrefixes) {
    const { data: matchedLocs } = await supabase
      .from('locations')
      .select('id, parent_id, slug');
    if (!matchedLocs) throw new Error('Unable to load clinic locations');
      
    if (matchedLocs && matchedLocs.length > 0) {
      locationIds = locationIdsForSlug(matchedLocs, params.locationSlug);
    }
  }

  let query = supabase.from('clinics').select('*, categories!inner(*), locations!inner(*)');
  
  if (params?.categorySlug && params.categorySlug !== 'all') {
    query = query.eq('categories.slug', params.categorySlug);
  }
  
  if (addressPrefixes) {
    query = query.or(addressFilter(addressPrefixes));
  } else if (locationIds.length > 0) {
    query = query.in('location_id', locationIds);
  } else if (params?.locationSlug && params.locationSlug !== 'all') {
    query = query.eq('locations.slug', params.locationSlug);
  }
  
  // Restrict the text to literal search terms; never pass PostgREST operators from input.
  const terms = searchTerms(params?.query || '');
  for (const term of terms) {
    query = query.or(`name_en.ilike.%${term}%,name_ko.ilike.%${term}%,address_en.ilike.%${term}%,address_ko.ilike.%${term}%`);
  }
  // A nonempty query consisting only of punctuation cannot become an unfiltered search.
  if (params?.query?.trim() && terms.length === 0) return [];
  if (params?.specialist) query = query.eq('has_specialist', true);

  // Always bring premium first, then other clinics
  query = query.order('is_premium', { ascending: false }).order('id').limit(params?.limit || 100);
  
  const { data, error } = await query;
  if (error) {
    console.error('Supabase getClinics error:', error);
    throw new Error('Unable to load clinics. Please try again later.');
  }
  return data || [];
}

export async function getClinicById(id: string) {
  // Check mock clinics first for custom slugs
  const mockMatch = mockClinics.find(c => c.id === id);
  if (mockMatch) return { ...mockMatch, categories: mockMatch.category, locations: mockMatch.location };

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
