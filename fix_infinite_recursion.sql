
BEGIN;

-- 1. Helper Function to safely check admin status without recursion
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

-- 2. Clean up old recursive policies AND potentially conflicting ones
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage user_badges" ON user_badges;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 3. Create Clean Non-Recursive Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (public.is_admin());

-- 4. Fix User Badges
DROP POLICY IF EXISTS "Admins can manage badges" ON user_badges;
DROP POLICY IF EXISTS "Everyone can view badges" ON user_badges;

CREATE POLICY "Admins can manage badges" ON user_badges FOR ALL USING (public.is_admin());
CREATE POLICY "Everyone can view badges" ON user_badges FOR SELECT USING (true);

COMMIT;
