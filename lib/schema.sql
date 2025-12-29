-- ============================================
-- RESET DATABASE SCRIPT
-- This will drop all existing tables and recreate them
-- ============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Public Read Songs" ON songs;
DROP POLICY IF EXISTS "Admin Insert Songs" ON songs;
DROP POLICY IF EXISTS "Admin Update Delete Songs" ON songs;
DROP POLICY IF EXISTS "Public Read Profiles" ON profiles;

-- Drop existing tables
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

-- 1. Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create songs table
CREATE TABLE songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  image_url TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Profiles: Users can read all profiles
CREATE POLICY "Public Read Profiles" ON profiles
  FOR SELECT USING (true);

-- Profiles: Users can insert their own profile
CREATE POLICY "Users Insert Own Profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Profiles: Users can update their own profile (except is_admin)
CREATE POLICY "Users Update Own Profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Songs: Everyone can read songs
CREATE POLICY "Public Read Songs" ON songs
  FOR SELECT USING (true);

-- Songs: Only admins can insert songs
CREATE POLICY "Admin Insert Songs" ON songs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Songs: Only admins can update songs
CREATE POLICY "Admin Update Songs" ON songs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Songs: Only admins can delete songs
CREATE POLICY "Admin Delete Songs" ON songs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_songs_created_at ON songs(created_at DESC);
CREATE INDEX idx_songs_user_id ON songs(user_id);
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin);

-- ============================================
-- NOTES
-- ============================================

-- After running this script:
-- 1. Make sure storage buckets 'songs' and 'images' exist in Supabase Storage
-- 2. Set appropriate storage policies for public read access
-- 3. To make a user an admin, run:
--    UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';
