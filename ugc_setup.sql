-- 1. PROFILES: Add role column if it doesn't exist
-- We first check if the table exists to be safe, though it should.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 2. RINGTONES: Add status and rejection_reason
ALTER TABLE public.ringtones ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.ringtones ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE public.ringtones ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id);

-- 3. Backfill existing ringtones to 'approved'
-- This assumes all currently existing ringtones are valid.
UPDATE public.ringtones SET status = 'approved' WHERE status = 'pending'; 

-- 4. RLS POLICIES

-- RINGTONES
ALTER TABLE public.ringtones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts/confusion
DROP POLICY IF EXISTS "Enable read access for all users" ON public.ringtones;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.ringtones;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.ringtones;

-- READ: Public can only see APPROVED ringtones. 
-- Users can see their own PENDING/REJECTED ringtones.
-- Admins can see ALL.
CREATE POLICY "Public read approved" ON public.ringtones
FOR SELECT
USING (
  status = 'approved' 
  OR 
  auth.uid() = user_id
  OR
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- INSERT: Authenticated users can upload (status will be pending by default)
CREATE POLICY "Authenticated insert" ON public.ringtones
FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Users can update their own ringtones (e.g. fix details), but maybe reset status?
-- For now, let's just allow Admins to update Status.
-- And Users can update their own if pending? Let's keep it simple:
-- Admins can update everything.
-- Users can potentially delete their own?
CREATE POLICY "Admin update all" ON public.ringtones
FOR UPDATE
USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- DELETE: Admins can delete. Users can delete their own.
CREATE POLICY "Delete own or admin" ON public.ringtones
FOR DELETE
USING (
  auth.uid() = user_id
  OR
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);


-- PROFILES:
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- 5. FUNCTION to handle new user signup (if not exists)
-- This is usually done via triggers in Supabase
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
