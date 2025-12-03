-- Add movie_director column to ringtones table
ALTER TABLE public.ringtones ADD COLUMN IF NOT EXISTS movie_director text;
