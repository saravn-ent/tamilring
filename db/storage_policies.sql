-- RLS is enabled by default on storage.objects in Supabase. 
-- We skip ALTER TABLE to avoid ownership errors (42501).

-- Create Ringtone Bucket if not exists
INSERT INTO storage.buckets (id, name, public) VALUES ('ringtones', 'ringtones', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- RINGTONE BUCKET POLICIES
-- Public Read
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'ringtones');

-- Auth Upload with STRICT validation (SECURITY)
-- Prevents shell uploads, oversized files, and malicious content
CREATE POLICY "Auth Upload with Validation" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'ringtones' AND 
    auth.role() = 'authenticated' AND
    -- File size limit: 10MB (10,485,760 bytes)
    (storage.foldername(name))[1] = auth.uid()::text AND
    -- MIME type whitelist (audio files only)
    (
        (storage.extension(name) = 'mp3' AND (metadata->>'mimetype')::text = 'audio/mpeg') OR
        (storage.extension(name) = 'm4a' AND (metadata->>'mimetype')::text IN ('audio/mp4', 'audio/x-m4a')) OR
        (storage.extension(name) = 'm4r' AND (metadata->>'mimetype')::text IN ('audio/mp4', 'audio/x-m4a')) OR
        (storage.extension(name) = 'wav' AND (metadata->>'mimetype')::text IN ('audio/wav', 'audio/x-wav')) OR
        (storage.extension(name) = 'aac' AND (metadata->>'mimetype')::text = 'audio/aac')
    ) AND
    -- File size limit: 10MB
    (metadata->>'size')::int < 10485760
);

-- Owner Update/Delete
CREATE POLICY "Owner Update" ON storage.objects FOR UPDATE USING (
    bucket_id = 'ringtones' AND 
    auth.uid() = owner
);

CREATE POLICY "Owner Delete" ON storage.objects FOR DELETE USING (
    bucket_id = 'ringtones' AND 
    auth.uid() = owner
);

-- AVATAR BUCKET POLICIES
CREATE POLICY "Avatar Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Avatar Auth Upload" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
);

CREATE POLICY "Avatar Owner Update" ON storage.objects FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid() = owner
);

CREATE POLICY "Avatar Owner Delete" ON storage.objects FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid() = owner
);
