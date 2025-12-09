-- Add audio_url_iphone column to ringtones table
ALTER TABLE ringtones 
ADD COLUMN IF NOT EXISTS audio_url_iphone TEXT;

-- Verify column addition
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ringtones' AND column_name = 'audio_url_iphone';
