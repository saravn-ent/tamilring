
BEGIN;

-- 1. Ensure 'profiles' has necessary columns and defaults
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE profiles ALTER COLUMN points SET DEFAULT 0;
ALTER TABLE profiles ALTER COLUMN level SET DEFAULT 1;

-- 2. Create Helper Function to check Admin (Security Critical)
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

-- 3. Create Trigger to automatically create profiles for new users
-- This fixes the issue where new users have no profile and thus no points.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, points, level, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    0,
    1,
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Bind trigger (Drop first to ensure clean state)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Create Secure RPC for awarding points (Atomic & Admin Only)
CREATE OR REPLACE FUNCTION award_points_securely(target_user_id uuid, amount int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_points int;
  new_points int;
  new_level int;
BEGIN
  -- Check Authorization
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: Only admins can award points';
  END IF;

  -- Lock row to prevent race conditions
  PERFORM 1 FROM profiles WHERE id = target_user_id FOR UPDATE;

  -- Update with calculation
  UPDATE profiles 
  SET 
    points = COALESCE(points, 0) + amount,
    level = FLOOR((COALESCE(points, 0) + amount) / 500) + 1
  WHERE id = target_user_id;
END;
$$;

COMMIT;
