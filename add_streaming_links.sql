-- Add streaming link columns to ringtones table
ALTER TABLE public.ringtones ADD COLUMN IF NOT EXISTS apple_music_link text;
ALTER TABLE public.ringtones ADD COLUMN IF NOT EXISTS spotify_link text;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
