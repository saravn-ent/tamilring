-- 1. Create the bucket 'ringtone-files' if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('ringtone-files', 'ringtone-files', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Policies
-- We skip ALTER TABLE ... ENABLE RLS as it is already enabled by default and requires superuser permissions to toggle.

-- READ
-- We use DO blocks or simple drops. 
-- Note: You might see 'policy does not exist' warnings if they don't exist, which is fine.

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'ringtone-files' );

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'ringtone-files' );

DROP POLICY IF EXISTS "Users can update own objects" ON storage.objects;
CREATE POLICY "Users can update own objects"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'ringtone-files' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'ringtone-files' AND auth.uid() = owner );

DROP POLICY IF EXISTS "Users can delete own objects" ON storage.objects;
CREATE POLICY "Users can delete own objects"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'ringtone-files' AND auth.uid() = owner );
