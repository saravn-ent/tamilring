-- Alter the ringtones table to support multi-select tags
-- We will add a new column 'tags' which is an array of text strings

ALTER TABLE public.ringtones ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Optional: If you want to migrate existing 'mood' data to the new 'tags' column
-- UPDATE public.ringtones SET tags = ARRAY[mood] WHERE mood IS NOT NULL AND tags = '{}';

-- Note: We are keeping the 'mood' column for now to avoid breaking existing data, 
-- but the application will now primarily use 'tags'.
