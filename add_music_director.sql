-- Add music_director column to ringtones table
ALTER TABLE public.ringtones ADD COLUMN IF NOT EXISTS music_director text;
