
-- 1. NUKE ALL POLICIES on 'ringtones' to be absolutely sure
DO $$ 
DECLARE 
    pol RECORD; 
BEGIN 
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'ringtones' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON ringtones', pol.policyname); 
    END LOOP; 
END $$;

-- 2. Create CLEAN policies for ringtones

-- A. VIEW: Everyone can view ringtones
CREATE POLICY "Ringtones are viewable by everyone" 
ON ringtones FOR SELECT 
USING (true);

-- B. INSERT: Authenticated users can upload
CREATE POLICY "Users can upload ringtones" 
ON ringtones FOR INSERT 
TO authenticated
WITH CHECK (true);

-- C. UPDATE: Admins can update any ringtone (approve/reject)
CREATE POLICY "Admins can update ringtones" 
ON ringtones FOR UPDATE 
USING (public.is_admin());

-- D. DELETE: Admins can delete ringtones
CREATE POLICY "Admins can delete ringtones" 
ON ringtones FOR DELETE 
USING (public.is_admin());

-- 3. Ensure status column exists (just in case)
ALTER TABLE ringtones ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE ringtones ADD COLUMN IF NOT EXISTS rejection_reason text;
