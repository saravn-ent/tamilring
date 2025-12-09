
-- Add indexes to improve Homepage performance and filtering
-- These columns are heavily used in WHERE key and ORDER BY clauses

CREATE INDEX IF NOT EXISTS idx_ringtones_status ON public.ringtones(status);
CREATE INDEX IF NOT EXISTS idx_ringtones_likes ON public.ringtones(likes DESC);
CREATE INDEX IF NOT EXISTS idx_ringtones_created_at ON public.ringtones(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ringtones_movie_name ON public.ringtones(movie_name);

-- Composite index for the most common "Recent & Approved" query
CREATE INDEX IF NOT EXISTS idx_ringtones_status_created_at ON public.ringtones(status, created_at DESC);
