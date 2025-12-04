-- 1. Enable RLS on the table (ensure it's on)
ALTER TABLE public.ringtones ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing INSERT policies to start fresh and avoid conflicts
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.ringtones;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.ringtones;
DROP POLICY IF EXISTS "Allow public uploads" ON public.ringtones;

-- 3. Create a policy to allow Authenticated users to upload (INSERT)
-- This allows any logged-in user to upload a ringtone.
CREATE POLICY "Enable insert for authenticated users only"
ON public.ringtones
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. (Optional) If you want NON-logged in users to upload too, uncomment the next lines:
-- CREATE POLICY "Enable insert for anonymous users"
-- ON public.ringtones
-- FOR INSERT
-- TO anon
-- WITH CHECK (true);

-- 5. Ensure READ access is still available for everyone
-- We use IF NOT EXISTS logic by dropping first to be safe or just ensuring it exists.
-- It's safer to just ensure the policy exists.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.ringtones;
CREATE POLICY "Enable read access for all users"
ON public.ringtones
FOR SELECT
USING (true);

-- 6. Allow UPDATE for Likes/Downloads (if you want users to be able to increment counts)
-- Note: The RPC functions we added earlier bypass RLS for specific increments, 
-- but if you use the client-side update fallback, you need this.
DROP POLICY IF EXISTS "Enable update for all users" ON public.ringtones;
CREATE POLICY "Enable update for all users"
ON public.ringtones
FOR UPDATE
USING (true)
WITH CHECK (true);
