-- Add lyricist field to ringtones table
ALTER TABLE ringtones ADD COLUMN IF NOT EXISTS lyricist TEXT;
