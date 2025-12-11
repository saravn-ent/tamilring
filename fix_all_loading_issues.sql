
BEGIN;

---------------------------------------------------------
-- 1. FIX PROFILES (The Root Cause)
---------------------------------------------------------
-- Remove ALL existing policies on profiles
DO $$ 
DECLARE pol RECORD; 
BEGIN 
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname); 
    END LOOP; 
END $$;

-- Helper Function (Critical for avoiding recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create clean policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (public.is_admin());

-- Ensure role column default
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'user';

---------------------------------------------------------
-- 2. FIX RINGTONES (The Content)
---------------------------------------------------------
-- Remove ALL existing policies on ringtones
DO $$ 
DECLARE pol RECORD; 
BEGIN 
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'ringtones' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON ringtones', pol.policyname); 
    END LOOP; 
END $$;

-- Re-create clean policies
CREATE POLICY "Ringtones are viewable by everyone" ON ringtones FOR SELECT USING (true);
CREATE POLICY "Users can upload ringtones" ON ringtones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update ringtones" ON ringtones FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete ringtones" ON ringtones FOR DELETE USING (public.is_admin());

---------------------------------------------------------
-- 3. FIX BADGES (The Gamification)
---------------------------------------------------------
-- Remove ALL existing policies on user_badges
DO $$ 
DECLARE pol RECORD; 
BEGIN 
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'user_badges' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_badges', pol.policyname); 
    END LOOP; 
END $$;

-- Re-create clean policies
CREATE POLICY "Everyone can view badges" ON user_badges FOR SELECT USING (true);
CREATE POLICY "Admins can manage badges" ON user_badges FOR ALL USING (public.is_admin());

COMMIT;
