-- Clinic Categories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'urology', 'dentistry', 'internal-medicine'
    name_ko VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_mn VARCHAR(100) NOT NULL
);

-- Locations (Seoul Metropolitan Area)
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'gangnam', 'seoul-station', 'incheon', 'dongtan', 'jamsil'
    name_ko VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_mn VARCHAR(100) NOT NULL,
    parent_id INT REFERENCES locations(id) -- Supports hierarchical regions
);

-- Clinics (Stores standard HIRA data + premium marketing data)
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hira_code VARCHAR(50) UNIQUE, -- Public ID from HIRA
    name_ko VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    name_mn VARCHAR(150) NOT NULL,
    category_id INT REFERENCES categories(id) NOT NULL,
    location_id INT REFERENCES locations(id) NOT NULL,
    telephone VARCHAR(30),
    address_ko TEXT NOT NULL,
    address_en TEXT,
    address_mn TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    
    -- Tier Control
    is_premium BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Premium Data (JSONB block containing images, custom descriptions, doctor profiles, etc.)
    premium_data JSONB DEFAULT '{}'::jsonb,
    
    -- Operating hours specification
    opening_hours JSONB DEFAULT '{}'::jsonb,
    
    -- SEO and Filtering Flags (Extracted from HIRA)
    has_specialist BOOLEAN DEFAULT FALSE,
    sunday_open BOOLEAN DEFAULT FALSE,
    night_open BOOLEAN DEFAULT FALSE,
    newly_opened BOOLEAN DEFAULT FALSE,
    
    -- Public Data Attachments (Extracted from HIRA)
    public_facilities JSONB DEFAULT '{}'::jsonb, -- e.g. {"inpatient_beds": 5, "surgery_rooms": 1}
    public_equipment JSONB DEFAULT '[]'::jsonb,  -- e.g. ["ESWL", "CT", "MRI"]
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Informational Articles (For Blog Cluster SEO)
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(150) UNIQUE NOT NULL,
    title_en VARCHAR(200) NOT NULL,
    title_mn VARCHAR(200) NOT NULL,
    content_en TEXT NOT NULL,
    content_mn TEXT NOT NULL,
    main_image VARCHAR(255),
    category VARCHAR(50),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    modified_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all users (anonymous and authenticated)
CREATE POLICY "Allow public read access for categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access for locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Allow public read access for clinics" ON clinics FOR SELECT USING (true);
CREATE POLICY "Allow public read access for articles" ON articles FOR SELECT USING (true);
