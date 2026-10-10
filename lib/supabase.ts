import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Mock clinics database in case Supabase is not connected
export const mockClinics = [
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
    },
    public_equipment: ["ESWL (Stone Crusher)", "Ultrasound", "PCR"],
    public_facilities: { inpatient_beds: 0, surgery_rooms: 1 }
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
    latitude: 37.559090,
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
  },
  {
    id: "goldman-dongtan",
    name_ko: "골드만비뇨의학과의원 동탄점",
    name_en: "Goldman Urology Clinic Dongtan",
    name_mn: "Голдман Бөөр, Шээсний замын эмнэлэг Донтан салбар",
    category: { slug: "urology", name_en: "Urology", name_mn: "Бөөрний булчирхай" },
    location: { slug: "dongtan", name_en: "Dongtan", name_mn: "Донтан" },
    telephone: "031-373-7532",
    address_ko: "경기 화성시 동탄대로 489",
    address_en: "489, Dongtandaero, Hwaseong-si, Gyeonggi-do, Republic of Korea",
    address_mn: "БНСУ, Кёнги аймаг, Хвасон хот, Донтан-дэро 489",
    latitude: 37.197359,
    longitude: 127.098263,
    is_premium: true,
    premium_data: {
      slogan_en: "Gyeonggi Southern region leading urologic clinic. State-of-the-art facilities.",
      slogan_mn: "Кёнги өмнөд бүсийн тэргүүлэх бөөр шээсний замын эмнэлэг. Орчин үеийн тоног төхөөрөмж.",
      website: "https://www.gold-man.com",
      map_link: "https://maps.app.goo.gl/GkAHdL8H312DpNYN9",
      booking_link: "https://www.gold-man.com",
      languages: ["Korean", "English"],
      doctors: [
        { name_en: "Dr. Seo Ju-seon", role_en: "Director / Urology specialist" }
      ],
      specialties: [
        "Prostate treatment",
        "Male wellness & Anti-aging",
        "Vasectomy & Circumcision"
      ]
    },
    opening_hours: {
      weekday_mon_thu: "09:00 - 19:00",
      weekday_tue_wed_fri: "09:00 - 18:00",
      saturday: "09:00 - 15:00",
      sunday: "Closed"
    }
  },
  {
    id: "goldman-jamsil",
    name_ko: "골드만비뇨의학과의원 잠실점",
    name_en: "Goldman Urology Clinic Jamsil",
    name_mn: "Голдман Бөөр, Шээсний замын эмнэлэг Жамшил салбар",
    category: { slug: "urology", name_en: "Urology", name_mn: "Бөөрний булчирхай" },
    location: { slug: "jamsil", name_en: "Jamsil", name_mn: "Жамшил" },
    telephone: "02-421-7511",
    address_ko: "서울 송파구 올림픽로35길 137",
    address_en: "137, Olympic-ro 35-gil, Songpa-gu, Seoul, Republic of Korea",
    address_mn: "БНСУ, Сөүл хот, Сонпа-гү, Олимпик-ру 35-гил 137",
    latitude: 37.515927,
    longitude: 127.099643,
    is_premium: true,
    premium_data: {
      slogan_en: "Expert urologists in Jamsil. Comprehensive diagnostic system.",
      slogan_mn: "Жамшил дахь мэргэжлийн бөөр шээсний замын эмч нар. Иж бүрэн оношилгооны систем.",
      website: "https://www.gold-man.com",
      map_link: "https://maps.app.goo.gl/xbQgKa5ZHN7ABcV4A",
      booking_link: "https://www.gold-man.com",
      languages: ["Korean", "English", "Russian"],
      doctors: [
        { name_en: "Dr. Ryu Ji-soo", role_en: "Director / Urology specialist" }
      ],
      specialties: [
        "Prostatitis",
        "Erectile Dysfunction",
        "STI Multiplex PCR tests"
      ]
    },
    opening_hours: {
      weekday: "09:00 - 18:00",
      saturday: "09:00 - 16:00",
      sunday: "Closed"
    }
  },
  {
    id: "severance-gangnam",
    name_ko: "강남세브란스병원",
    name_en: "Gangnam Severance Hospital",
    name_mn: "Гангнам Сэбэранс Нэгдсэн Эмнэлэг",
    category: { slug: "internal-medicine", name_en: "Internal Medicine", name_mn: "Дотор ажилбар" },
    location: { slug: "gangnam", name_en: "Gangnam", name_mn: "Гангнам" },
    telephone: "02-2019-2114",
    address_ko: "서울 강남구 언주로 211",
    address_en: "211, Eonju-ro, Gangnam-gu, Seoul, Republic of Korea",
    address_mn: "БНСУ, Сөүл хот, Гангнам-гү, Онжү-ру 211",
    latitude: 37.492764,
    longitude: 127.046274,
    is_premium: false,
    premium_data: {},
    opening_hours: {
      weekday: "09:00 - 17:30",
      saturday: "09:00 - 12:00",
      sunday: "Closed"
    }
  },
  {
    id: "seoul-dental",
    name_ko: "서울치과의원",
    name_en: "Seoul Dental Clinic",
    name_mn: "Сөүл шүүдний эмнэлэг",
    category: { slug: "dentistry", name_en: "Dentistry", name_mn: "Шүдний эмнэлэг" },
    location: { slug: "seoul-station", name_en: "Seoul Station", name_mn: "Сөүл өртөө" },
    telephone: "02-753-2275",
    address_ko: "서울 중구 퇴계로 18",
    address_en: "18, Toegye-ro, Jung-gu, Seoul, Republic of Korea",
    address_mn: "БНСУ, Сөүл хот, Жүн-гү, Төгэ-ру 18",
    latitude: 37.557452,
    longitude: 126.978541,
    is_premium: false,
    premium_data: {},
    opening_hours: {
      weekday: "09:30 - 18:30",
      saturday: "09:30 - 13:00",
      sunday: "Closed"
    }
  }
];

export async function getClinics() {
  if (supabase) {
    const { data, error } = await supabase
      .from('clinics')
      .select('*, category_id(*), location_id(*)');
    if (!error && data) return data;
  }
  return mockClinics;
}

export async function getClinicById(id: string) {
  if (supabase) {
    const { data, error } = await supabase
      .from('clinics')
      .select('*, category_id(*), location_id(*)')
      .eq('id', id)
      .single();
    if (!error && data) return data;
  }
  return mockClinics.find(c => c.id === id) || null;
}
