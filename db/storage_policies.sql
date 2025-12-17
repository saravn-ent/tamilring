-- RLS is enabled by default on storage.objects in Supabase. 
-- We skip ALTER TABLE to avoid ownership errors (42501).

-- Create Ringtone Bucket if not exists
INSERT INTO storage.buckets (id, name, public) VALUES ('ringtones', 'ringtones', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- RINGTONE BUCKET POLICIES
-- Public Read
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'ringtones');

-- Auth Upload (Users can upload to their own folder? Or just generally authenticated?)
-- For simplicity, authenticated users can upload. Better: check file extension/size here if possible, but easier in app.
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'ringtones' AND 
    auth.role() = 'authenticated'
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
