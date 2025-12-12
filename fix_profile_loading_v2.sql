
-- FIX PROFILE LOADING (Infinite Recursion)
-- This script fixes the "Loading profile..." hang by preventing RLS recursion.

BEGIN;

-- 1. Helper Function: is_admin()
-- CRITICAL: Must be SECURITY DEFINER to bypass RLS when checking the role.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- This query runs with privileges of the function creator (postgres/admin), 
  -- bypassing RLS on 'profiles', preventing infinite recursion.
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Clean up 'profiles' policies
-- Drop ALL existing policies to ensure no recursive ones remain.
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage user_badges" ON user_badges;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- 3. Apply SAFE Policies
-- A. VIEW: Public (no recursion possible here)
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- B. UPDATE: Own Profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- C. UPDATE: Admins (Uses SECURITY DEFINER function)
CREATE POLICY "Admins can update all profiles" 
ON profiles FOR UPDATE 
USING (public.is_admin());

-- D. INSERT
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 4. Apply SAFE Policies for 'user_badges' (Just in case)
DROP POLICY IF EXISTS "Admins can manage badges" ON user_badges;
DROP POLICY IF EXISTS "Everyone can view badges" ON user_badges;

CREATE POLICY "Admins can manage badges" 
ON user_badges FOR ALL 
USING (public.is_admin());

CREATE POLICY "Everyone can view badges" 
ON user_badges FOR SELECT 
USING (true);

COMMIT;
