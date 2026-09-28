-- Seed Categories
INSERT INTO categories (id, slug, name_ko, name_en, name_mn) VALUES
(1, 'urology', '비뇨의학과', 'Urology', 'Бөөрний булчирхай, шээсний замын эмгэг судлал'),
(2, 'dentistry', '치과', 'Dentistry', 'Шүдний эмнэлэг'),
(3, 'internal-medicine', '내과', 'Internal Medicine', 'Дотор ажилбар'),
(4, 'dermatology', '피부과', 'Dermatology', 'Арьс өнгөний эмнэлэг'),
(5, 'plastic-surgery', '성형외과', 'Plastic Surgery', 'Гоо сайхны мэс засал')
ON CONFLICT (slug) DO NOTHING;

-- Seed Locations
INSERT INTO locations (id, slug, name_ko, name_en, name_mn, parent_id) VALUES
(1, 'seoul', '서울', 'Seoul', 'Сөүл', NULL),
(2, 'incheon', '인천', 'Incheon', 'Инчон', NULL),
(3, 'gyeonggi', '경기', 'Gyeonggi', 'Кёнги', NULL)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO locations (id, slug, name_ko, name_en, name_mn, parent_id) VALUES
(4, 'gangnam', '강남', 'Gangnam', 'Гангнам', 1),
(5, 'seoul-station', '서울역', 'Seoul Station', 'Сөүл өртөө', 1),
(6, 'jamsil', '잠실', 'Jamsil', 'Жамшил', 1),
(7, 'incheon-namdong', '인천 남동구', 'Namdong-gu, Incheon', 'Намдун-гү, Инчон', 2),
(8, 'dongtan', '동탄', 'Dongtan', 'Донтан', 3)
ON CONFLICT (slug) DO NOTHING;

-- Seed Goldman Urology Clinics (Premium)
INSERT INTO clinics (name_ko, name_en, name_mn, category_id, location_id, telephone, address_ko, address_en, address_mn, latitude, longitude, is_premium, premium_data, opening_hours) VALUES
(
    '골드만비뇨의학과의원 강남점', 
    'Goldman Urology Clinic Gangnam', 
    'Голдман Бөөр, Шээсний замын эмнэлэг Гангнам салбар',
    1, 4, '02-556-7533', 
    '서울 서초구 서운로 12, 2층', 
    '2F, 12, Seoun-ro, Seocho-gu, Seoul, Republic of Korea',
    'БНСУ, Сөүл хот, Сочо-гү, Соүн-ру 12, 2 давхар',
    37.4850533504305, 127.029858982399,
    TRUE,
    '{
        "slogan_en": "Over 25 years of experience, 2 million+ clinical cases. Trusted Urology.",
        "slogan_mn": "25 гаруй жилийн туршлага, 2 сая гаруй клиник тохиолдол. Итгэлт бөөр шээсний замын эмнэлэг.",
        "website": "https://www.gold-man.com",
        "map_link": "https://maps.app.goo.gl/DugsPrz3a82QxBw36",
        "booking_link": "https://www.gold-man.com",
        "languages": ["Korean", "English", "Mongolian", "Chinese"],
        "doctors": [
            {"name_en": "Dr. Jo Chang-geun", "role_en": "Representative Director / Urology specialist"},
            {"name_en": "Dr. Ryu Kyeong-ho", "role_en": "Director / Urology specialist"}
        ],
        "specialties": [
            "Prostate diseases (BPH, Prostatitis)",
            "STD & Sexual Health",
            "Urinary tract stones (24h emergency lithotripsy)",
            "Da Vinci SP Robot Surgery"
        ]
    }'::jsonb,
    '{
        "weekday": "09:00 - 18:00",
        "saturday": "09:00 - 16:00",
        "sunday": "Closed"
    }'::jsonb
),
(
    '골드만비뇨의학과의원 서울역점', 
    'Goldman Urology Clinic Seoul Station', 
    'Голдман Бөөр, Шээсний замын эмнэлэг Сөүл өртөө салбар',
    1, 5, '02-773-7522', 
    '서울 중구 세종대로 23', 
    '23, Sejong-daero, Jung-gu, Seoul, Republic of Korea',
    'БНСУ, Сөүл хот, Жүн-гү, Сэжон-дэро 23',
    37.5590909738298, 126.973844589811,
    TRUE,
    '{
        "slogan_en": "Easy access right next to Seoul Station. Multi-language friendly urological care.",
        "slogan_mn": "Сөүл өртөөний хажууд хялбар байршил. Олон хэлээр бөөр шээсний замын тусламж үйлчилгээ.",
        "website": "https://www.gold-man.com",
        "map_link": "https://maps.app.goo.gl/cdqDgDGurZEqX5EA8",
        "booking_link": "https://www.gold-man.com",
        "languages": ["Korean", "English", "Japanese"],
        "doctors": [
            {"name_en": "Dr. Min Seung-gi", "role_en": "Director / Urology specialist"}
        ],
        "specialties": [
            "Prostate BPH (Holep, Rezum, Aquablation)",
            "Female Urology",
            "STD & Premature Ejaculation"
        ]
    }'::jsonb,
    '{
        "weekday": "09:00 - 18:00",
        "saturday": "09:00 - 16:00",
        "sunday": "Closed"
    }'::jsonb
),
(
    '골드만비뇨의학과의원 인천점', 
    'Goldman Urology Clinic Incheon', 
    'Голдман Бөөр, Шээсний замын эмнэлэг Инчон салбар',
    1, 7, '032-221-1911', 
    '인천 남동구 예술로 138', 
    '138, Yesul-ro, Namdong-gu, Incheon, Republic of Korea',
    'БНСУ, Инчон хот, Намдун-гү, Есүл-ру 138',
    37.4462417896974, 126.701006353999,
    TRUE,
    '{
        "slogan_en": "Highest standard urology in Incheon area. Rapid response care.",
        "slogan_mn": "Инчон бүсийн хамгийн өндөр стандартын бөөр шээсний замын эмнэлэг.",
        "website": "https://www.gold-man.com",
        "map_link": "https://maps.app.goo.gl/py7jE2dCYFE2sVLF7",
        "booking_link": "https://www.gold-man.com",
        "languages": ["Korean", "English"],
        "doctors": [
            {"name_en": "Dr. Kim Tae-heon", "role_en": "Director / Urology specialist"}
        ],
        "specialties": [
            "Urethritis & UTI",
            "Urinary Stones",
            "Male Infertility"
        ]
    }'::jsonb,
    '{
        "weekday": "09:00 - 18:00",
        "saturday": "09:00 - 16:00",
        "sunday": "Closed"
    }'::jsonb
),
(
    '골드만비뇨의학과의원 동탄점', 
    'Goldman Urology Clinic Dongtan', 
    'Голдман Бөөр, Шээсний замын эмнэлэг Донтан салбар',
    1, 8, '031-373-7532', 
    '경기 화성시 동탄대로 489', 
    '489, Dongtandaero, Hwaseong-si, Gyeonggi-do, Republic of Korea',
    'БНСУ, Кёнги аймаг, Хвасон хот, Донтан-дэро 489',
    37.1973592693437, 127.098263708758,
    TRUE,
    '{
        "slogan_en": "Gyeonggi Southern region leading urologic clinic. State-of-the-art facilities.",
        "slogan_mn": "Кёнги өмнөд бүсийн тэргүүлэх бөөр шээсний замын эмнэлэг. Орчин үеийн тоног төхөөрөмж.",
        "website": "https://www.gold-man.com",
        "map_link": "https://maps.app.goo.gl/GkAHdL8H312DpNYN9",
        "booking_link": "https://www.gold-man.com",
        "languages": ["Korean", "English"],
        "doctors": [
            {"name_en": "Dr. Seo Ju-seon", "role_en": "Director / Urology specialist"}
        ],
        "specialties": [
            "Prostate treatment",
            "Male wellness & Anti-aging",
            "Vasectomy & Circumcision"
        ]
    }'::jsonb,
    '{
        "weekday_mon_thu": "09:00 - 19:00",
        "weekday_tue_wed_fri": "09:00 - 18:00",
        "saturday": "09:00 - 15:00",
        "sunday": "Closed"
    }'::jsonb
),
(
    '골드만비뇨의학과의원 잠실점', 
    'Goldman Urology Clinic Jamsil', 
    'Голдман Бөөр, Шээсний замын эмнэлэг Жамшил салбар',
    1, 6, '02-421-7511', 
    '서울 송파구 올림픽로35길 137', 
    '137, Olympic-ro 35-gil, Songpa-gu, Seoul, Republic of Korea',
    'БНСУ, Сөүл хот, Сонпа-гү, Олимпик-ру 35-гил 137',
    37.5159272595028, 127.099643159822,
    TRUE,
    '{
        "slogan_en": "Expert urologists in Jamsil. Comprehensive diagnostic system.",
        "slogan_mn": "Жамшил дахь мэргэжлийн бөөр шээсний замын эмч нар. Иж бүрэн оношилгооны систем.",
        "website": "https://www.gold-man.com",
        "map_link": "https://maps.app.goo.gl/xbQgKa5ZHN7ABcV4A",
        "booking_link": "https://www.gold-man.com",
        "languages": ["Korean", "English", "Russian"],
        "doctors": [
            {"name_en": "Dr. Ryu Ji-soo", "role_en": "Director / Urology specialist"}
        ],
        "specialties": [
            "Prostatitis",
            "Erectile Dysfunction",
            "STI Multiplex PCR tests"
        ]
    }'::jsonb,
    '{
        "weekday": "09:00 - 18:00",
        "saturday": "09:00 - 16:00",
        "sunday": "Closed"
    }'::jsonb
);

-- Seed Standard Clinics for SEO indexing (Gangnam/Seoul Station/etc)
INSERT INTO clinics (name_ko, name_en, name_mn, category_id, location_id, telephone, address_ko, address_en, address_mn, latitude, longitude, is_premium, premium_data, opening_hours) VALUES
(
    '강남세브란스병원', 'Gangnam Severance Hospital', 'Гангнам Сэбэранс Нэгдсэн Эмнэлэг',
    3, 4, '02-2019-2114',
    '서울 강남구 언주로 211',
    '211, Eonju-ro, Gangnam-gu, Seoul, Republic of Korea',
    'БНСУ, Сөүл хот, Гангнам-гү, Онжү-ру 211',
    37.492764, 127.046274,
    FALSE, '{}'::jsonb,
    '{"weekday": "09:00 - 17:30", "saturday": "09:00 - 12:00", "sunday": "Closed"}'::jsonb
),
(
    '서울치과의원', 'Seoul Dental Clinic', 'Сөүл шүүдний эмнэлэг',
    2, 5, '02-753-2275',
    '서울 중구 퇴계로 18',
    '18, Toegye-ro, Jung-gu, Seoul, Republic of Korea',
    'БНСУ, Сөүл хот, Жүн-гү, Төгэ-ру 18',
    37.557452, 126.978541,
    FALSE, '{}'::jsonb,
    '{"weekday": "09:30 - 18:30", "saturday": "09:30 - 13:00", "sunday": "Closed"}'::jsonb
);
