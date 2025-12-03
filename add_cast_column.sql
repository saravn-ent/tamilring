-- Add cast column to ringtones table
ALTER TABLE public.ringtones ADD COLUMN IF NOT EXISTS "cast" text;
