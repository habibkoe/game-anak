-- =============================================
-- Game-Anak Multi-User Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Groups Table
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    final_reward_text TEXT NOT NULL,
    final_reward_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Words Table
CREATE TABLE words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    image_src TEXT NOT NULL,
    order_position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public Content Table (for preview/demo)
CREATE TABLE public_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name TEXT NOT NULL,
    group_name TEXT NOT NULL,
    group_description TEXT,
    final_reward_text TEXT NOT NULL,
    final_reward_image TEXT,
    words JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_groups_user_id ON groups(user_id);
CREATE INDEX idx_groups_category_id ON groups(category_id);
CREATE INDEX idx_words_user_id ON words(user_id);
CREATE INDEX idx_words_group_id ON words(group_id);
CREATE INDEX idx_words_order ON words(group_id, order_position);
CREATE INDEX idx_public_content_active ON public_content(is_active);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_content ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Users can view their own categories"
    ON categories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
    ON categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
    ON categories FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
    ON categories FOR DELETE
    USING (auth.uid() = user_id);

-- Groups Policies
CREATE POLICY "Users can view their own groups"
    ON groups FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own groups"
    ON groups FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own groups"
    ON groups FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own groups"
    ON groups FOR DELETE
    USING (auth.uid() = user_id);

-- Words Policies
CREATE POLICY "Users can view their own words"
    ON words FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own words"
    ON words FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own words"
    ON words FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own words"
    ON words FOR DELETE
    USING (auth.uid() = user_id);

-- Public Content Policies (everyone can read, only admins can write)
CREATE POLICY "Anyone can view active public content"
    ON public_content FOR SELECT
    USING (is_active = true);

-- =============================================
-- SAMPLE PUBLIC CONTENT
-- =============================================

INSERT INTO public_content (
    category_name,
    group_name,
    group_description,
    final_reward_text,
    final_reward_image,
    words,
    is_active
) VALUES (
    'Aktivitas Sehari-hari',
    'Bermain & Aktivitas',
    'Kata-kata tentang bermain dan aktivitas anak',
    'Mobil Lego',
    '/images/lego-car.png',
    '[
        {
            "id": "preview-1",
            "text": "Anak bermain bola",
            "imageSrc": "/images/anak_main_bola.png",
            "order": 1
        },
        {
            "id": "preview-2",
            "text": "anak-anak main dengan kucing hitam dan putih",
            "imageSrc": "/images/anak_main_kucing.png",
            "order": 2
        },
        {
            "id": "preview-3",
            "text": "anak-anak makan bersama",
            "imageSrc": "/images/anak_makan.png",
            "order": 3
        },
        {
            "id": "preview-4",
            "text": "anak-anak memancing ikan di sungai",
            "imageSrc": "/images/anak_mancing_ikan.png",
            "order": 4
        },
        {
            "id": "preview-5",
            "text": "anak-anak menyebrang dengan hati-hati di jalan raya",
            "imageSrc": "/images/anak_nyebrang_jalan.png",
            "order": 5
        }
    ]'::jsonb,
    true
);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to automatically set user_id on insert
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id := auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to auto-set user_id
CREATE TRIGGER categories_set_user_id
    BEFORE INSERT ON categories
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();

CREATE TRIGGER groups_set_user_id
    BEFORE INSERT ON groups
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();

CREATE TRIGGER words_set_user_id
    BEFORE INSERT ON words
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();
