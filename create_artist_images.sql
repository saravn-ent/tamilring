-- 0. Ensure Permissions Mechanism Exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- CRITICAL: Make the user running this script an ADMIN immediately
-- This ensures "Only I can" works for the person executing this.
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = auth.uid();

-- 1. Create Artist Images Table
CREATE TABLE IF NOT EXISTS public.artist_images (
    artist_name text PRIMARY KEY,
    image_url text NOT NULL,
    updated_at timestamptz DEFAULT now(),
    uploaded_by uuid REFERENCES auth.users(id)
);

-- 2. Enable RLS
ALTER TABLE public.artist_images ENABLE ROW LEVEL SECURITY;

-- 3. Policies for Table

-- Drop existing policies to ensure clean state if re-running
DROP POLICY IF EXISTS "Artist images are viewable by everyone" ON public.artist_images;
DROP POLICY IF EXISTS "Admins can upload artist images" ON public.artist_images;
DROP POLICY IF EXISTS "Admins can update artist images" ON public.artist_images;

-- Everyone can read
CREATE POLICY "Artist images are viewable by everyone" 
ON public.artist_images FOR SELECT 
USING (true);

-- ONLY ADMINS can insert
CREATE POLICY "Admins can upload artist images" 
ON public.artist_images FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ONLY ADMINS can update
CREATE POLICY "Admins can update artist images" 
ON public.artist_images FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 4. Create Storage Bucket 'artist_images'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artist_images', 'artist_images', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage Policies

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update own uploads" ON storage.objects;

-- Everyone can view images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'artist_images');

-- ONLY ADMINS can upload files
CREATE POLICY "Admins can upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'artist_images' 
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ONLY ADMINS can update/delete
CREATE POLICY "Admins can update own uploads" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'artist_images' 
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
