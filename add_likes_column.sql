-- Add likes column to ringtones table
ALTER TABLE public.ringtones ADD COLUMN IF NOT EXISTS likes integer DEFAULT 0;
