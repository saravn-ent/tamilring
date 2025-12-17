-- ============================================
-- EMERGENCY RLS FIX - DEPLOY IMMEDIATELY
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Public read access" ON ringtones;
DROP POLICY IF EXISTS "Users can insert" ON ringtones;
DROP POLICY IF EXISTS "Users can update own" ON ringtones;
-- ... drop all other policies

-- ============================================
-- PROFILES TABLE
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles viewable by all" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Anyone can view public profiles
CREATE POLICY "Public profiles viewable by all"
  ON profiles FOR SELECT
  USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Profiles auto-created on signup
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- RINGTONES TABLE
-- ============================================
ALTER TABLE ringtones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Approved ringtones viewable by all" ON ringtones;
DROP POLICY IF EXISTS "Authenticated users can upload ringtones" ON ringtones;
DROP POLICY IF EXISTS "Users can update own pending ringtones" ON ringtones;
DROP POLICY IF EXISTS "Admins can update any ringtone" ON ringtones;

-- Anyone can view approved ringtones
CREATE POLICY "Approved ringtones viewable by all"
  ON ringtones FOR SELECT
  USING (
    status = 'approved' 
    OR (auth.uid() = user_id) -- Users can see their own
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload ringtones"
  ON ringtones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own pending ringtones
CREATE POLICY "Users can update own pending ringtones"
  ON ringtones FOR UPDATE
  USING (
    auth.uid() = user_id 
    AND status = 'pending'
  );

-- Admins can update any ringtone
CREATE POLICY "Admins can update any ringtone"
  ON ringtones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Ringtones bucket
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Public read approved ringtones" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;

-- Anyone can read approved ringtone files
CREATE POLICY "Public read approved ringtones"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ringtones'
    AND (
      EXISTS (
        SELECT 1 FROM ringtones 
        WHERE audio_url LIKE '%' || name || '%'
        AND status = 'approved'
      )
      OR auth.uid() IS NOT NULL -- Authenticated users can read all
    )
  );

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ringtones'
    AND auth.uid() IS NOT NULL
  );

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'ringtones'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_ringtones_status ON ringtones(status);
CREATE INDEX IF NOT EXISTS idx_ringtones_user_id ON ringtones(user_id);
CREATE INDEX IF NOT EXISTS idx_ringtones_movie_name ON ringtones(movie_name);
CREATE INDEX IF NOT EXISTS idx_ringtones_created_at ON ringtones(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ringtones_likes ON ringtones(likes DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ringtones_status_created 
  ON ringtones(status, created_at DESC) 
  WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_ringtones_status_likes 
  ON ringtones(status, likes DESC) 
  WHERE status = 'approved';
