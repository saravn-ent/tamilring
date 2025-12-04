-- Add missing columns to ringtones table if they don't exist
ALTER TABLE public.ringtones ADD COLUMN IF NOT EXISTS movie_director text;
ALTER TABLE public.ringtones ADD COLUMN IF NOT EXISTS music_director text;
ALTER TABLE public.ringtones ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE public.ringtones ADD COLUMN IF NOT EXISTS likes integer DEFAULT 0;
ALTER TABLE public.ringtones ADD COLUMN IF NOT EXISTS downloads integer DEFAULT 0;

-- Refresh the schema cache by notifying PostgREST (optional, but good practice)
NOTIFY pgrst, 'reload schema';
