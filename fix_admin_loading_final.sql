
-- 1. NUKE ALL POLICIES on 'profiles' to be absolutely sure
-- This anonymous block finds every policy on 'profiles' and drops it.
DO $$ 
DECLARE 
    pol RECORD; 
BEGIN 
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname); 
    END LOOP; 
END $$;

-- 2. Define the is_admin helper implementation (SECURITY DEFINER is critical!)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- This query runs with privileges of the function creator (admin), 
  -- bypassing RLS on 'profiles', preventing infinite recursion.
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create CLEAN policies
-- A. VIEW: Everyone can view profiles (needed for leaderboard, author links, etc.)
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- B. UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- C. UPDATE: Admins can update any profile (e.g. banning, promoting)
CREATE POLICY "Admins can update all profiles" 
ON profiles FOR UPDATE 
USING (public.is_admin());

-- D. INSERT: (Usually handled by triggers, but if needed)
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 4. Ensure 'role' column acts correctly (default to user)
ALTER TABLE profiles 
ALTER COLUMN role SET DEFAULT 'user';
