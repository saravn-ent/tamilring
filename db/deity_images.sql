-- Create table for storing custom deity images
CREATE TABLE IF NOT EXISTS deity_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deity_name TEXT NOT NULL UNIQUE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE deity_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can view deity images" ON deity_images
    FOR SELECT
    USING (true);

-- Allow authenticated users (or admins) to insert/update/delete
-- Assuming 'service_role' or specific admin logic. 
-- For now, let's allow authenticated users to do everything for simplicity based on existing pattern (user is likely admin if they can upload)
CREATE POLICY "Authenticated users can upload deity images" ON deity_images
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update deity images" ON deity_images
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete deity images" ON deity_images
    FOR DELETE
    USING (auth.role() = 'authenticated');
