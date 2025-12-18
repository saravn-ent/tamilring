-- Add reward tracking columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_first_upload_rewarded BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_withdrawn_count INTEGER DEFAULT 0;

-- Function to get trending ringtones based on engagement (likes + downloads) in the last 14 days
CREATE OR REPLACE FUNCTION get_trending_ringtones(limit_count INTEGER DEFAULT 10)
RETURNS SETOF ringtones AS $$
BEGIN
    RETURN QUERY
    SELECT r.*
    FROM ringtones r
    WHERE r.status = 'approved'
      AND (r.created_at >= NOW() - INTERVAL '14 days' OR (r.likes + r.downloads) > 0)
    ORDER BY (r.likes + r.downloads) DESC, r.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top albums (movies/deities) based on total engagement
CREATE OR REPLACE FUNCTION get_top_albums_v2(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    movie_name TEXT,
    poster_url TEXT,
    total_engagement BIGINT,
    ringtone_count BIGINT,
    latest_slug TEXT,
    max_year TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.movie_name,
        MAX(r.poster_url) as poster_url,
        SUM(COALESCE(r.likes, 0) + COALESCE(r.downloads, 0))::BIGINT as total_engagement,
        COUNT(r.id)::BIGINT as ringtone_count,
        MAX(r.slug) as latest_slug,
        MAX(r.movie_year) as max_year
    FROM ringtones r
    WHERE r.status = 'approved' AND r.movie_name IS NOT NULL
    GROUP BY r.movie_name
    HAVING SUM(COALESCE(r.likes, 0) + COALESCE(r.downloads, 0)) > 0 -- Ensure actually engaged
    ORDER BY total_engagement DESC, ringtone_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
