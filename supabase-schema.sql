-- ============================================
-- Panchayat Report Card — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Panchayat Settings (one row)
CREATE TABLE panchayat_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panchayat_name_hi TEXT NOT NULL,
    panchayat_name_en TEXT,
    block_hi TEXT,
    block_en TEXT,
    district_hi TEXT,
    district_en TEXT,
    state_hi TEXT NOT NULL,
    state_en TEXT NOT NULL,
    representative_name_hi TEXT,
    representative_name_en TEXT,
    representative_photo_url TEXT,
    spouse_name_hi TEXT,
    spouse_name_en TEXT,
    spouse_photo_url TEXT,
    village_photo_url TEXT,
    tenure_start INTEGER,
    tenure_end INTEGER,
    -- Election campaign fields
    election_slogan_hi TEXT,
    election_slogan_en TEXT,
    election_year INTEGER,
    election_symbol TEXT,
    campaign_message_hi TEXT,
    campaign_message_en TEXT,
    promises JSONB DEFAULT '[]'::jsonb,
    comparisons JSONB DEFAULT '[]'::jsonb,
    show_campaign BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_hi TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '📋',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_hi TEXT NOT NULL,
    title_en TEXT,
    description_hi TEXT,
    description_en TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    ward TEXT,
    location_hi TEXT,
    location_en TEXT,
    completion_year INTEGER,
    completion_date DATE,
    cost_lakhs NUMERIC(10,2),
    scheme TEXT,
    department TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    is_featured BOOLEAN DEFAULT false,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Project Images
CREATE TABLE project_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type TEXT NOT NULL DEFAULT 'additional' CHECK (image_type IN ('before', 'after', 'additional')),
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    ai_suggested_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Other Works
CREATE TABLE other_works (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_hi TEXT NOT NULL,
    title_en TEXT,
    description_hi TEXT,
    description_en TEXT,
    category TEXT,
    location_hi TEXT,
    location_en TEXT,
    event_date DATE,
    event_year INTEGER,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Other Work Images
CREATE TABLE other_work_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    other_work_id UUID NOT NULL REFERENCES other_works(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Welfare Stats
CREATE TABLE welfare_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label_hi TEXT NOT NULL,
    label_en TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '📊',
    count INTEGER NOT NULL DEFAULT 0,
    unit_hi TEXT NOT NULL,
    unit_en TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE panchayat_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE other_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE other_work_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE welfare_stats ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view the report card)
CREATE POLICY "Public read settings" ON panchayat_settings FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read project_images" ON project_images FOR SELECT USING (true);
CREATE POLICY "Public read other_works" ON other_works FOR SELECT USING (true);
CREATE POLICY "Public read other_work_images" ON other_work_images FOR SELECT USING (true);
CREATE POLICY "Public read welfare_stats" ON welfare_stats FOR SELECT USING (true);

-- Admin write access (using service_role key bypasses RLS, so these are for authenticated users)
CREATE POLICY "Admin insert settings" ON panchayat_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update settings" ON panchayat_settings FOR UPDATE USING (true);
CREATE POLICY "Admin insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Admin delete categories" ON categories FOR DELETE USING (true);
CREATE POLICY "Admin all projects" ON projects FOR ALL USING (true);
CREATE POLICY "Admin all project_images" ON project_images FOR ALL USING (true);
CREATE POLICY "Admin all other_works" ON other_works FOR ALL USING (true);
CREATE POLICY "Admin all other_work_images" ON other_work_images FOR ALL USING (true);
CREATE POLICY "Admin all welfare_stats" ON welfare_stats FOR ALL USING (true);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category_id);
CREATE INDEX idx_projects_year ON projects(completion_year);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_project_images_project ON project_images(project_id);
CREATE INDEX idx_other_works_status ON other_works(status);
CREATE INDEX idx_other_work_images_work ON other_work_images(other_work_id);

-- ============================================
-- Insert sample data
-- ============================================

-- Settings
INSERT INTO panchayat_settings (panchayat_name_hi, panchayat_name_en, block_hi, block_en, district_hi, district_en, state_hi, state_en, representative_name_hi, representative_name_en, spouse_name_hi, spouse_name_en, tenure_start, tenure_end)
VALUES ('ग्राम पंचायत सुनहरापुर', 'Gram Panchayat Sunahrapur', 'सदर', 'Sadar', 'रायपुर', 'Raipur', 'छत्तीसगढ़', 'Chhattisgarh', 'श्रीमती सीता देवी पटेल', 'Smt. Sita Devi Patel', 'श्री रामप्रसाद पटेल', 'Shri Ramprasad Patel', 2020, 2025);

-- Categories
INSERT INTO categories (name_hi, name_en, icon, sort_order) VALUES
('सड़क एवं नाली', 'Roads & Drains', '🛣️', 1),
('पेयजल', 'Drinking Water', '💧', 2),
('प्रकाश व्यवस्था', 'Street Lighting', '💡', 3),
('शिक्षा', 'Education', '🏫', 4),
('स्वच्छता', 'Cleanliness', '🧹', 5),
('सामुदायिक विकास', 'Community Development', '🏘️', 6),
('पर्यावरण', 'Environment', '🌳', 7),
('अन्य', 'Others', '⚡', 8);

-- Welfare Stats
INSERT INTO welfare_stats (label_hi, label_en, icon, count, unit_hi, unit_en, sort_order) VALUES
('आवास वितरण', 'Housing Distributed', '🏠', 85, 'आवास', 'Houses', 1),
('शौचालय निर्माण', 'Toilets Built', '🚽', 120, 'शौचालय', 'Toilets', 2),
('पेंशन लाभार्थी', 'Pension Beneficiaries', '👴', 65, 'लाभार्थी', 'Beneficiaries', 3),
('सड़क निर्माण', 'Roads Completed', '🛣️', 12, 'सड़कें', 'Roads', 4),
('नल-जल कनेक्शन', 'Tap Water Connections', '💧', 150, 'कनेक्शन', 'Connections', 5),
('राशन कार्ड', 'Ration Cards', '🪪', 210, 'कार्ड', 'Cards', 6);

-- Done! ✅
