-- Update Trending RPC to support language filtering and exclude broken ringtones
DROP FUNCTION IF EXISTS get_trending_ringtones(integer);
DROP FUNCTION IF EXISTS get_trending_ringtones(integer, text);

CREATE OR REPLACE FUNCTION get_trending_ringtones(limit_count INTEGER DEFAULT 10, lang_filter TEXT DEFAULT 'tamil')
RETURNS SETOF ringtones AS $$
BEGIN
    RETURN QUERY
    SELECT r.*
    FROM ringtones r
    WHERE r.status = 'approved'
      AND r.audio_url IS NOT NULL AND r.audio_url != ''
      AND r.poster_url IS NOT NULL AND r.poster_url != ''
      AND (
          (lang_filter = 'tamil' AND (r.language = 'tamil' OR r.language IS NULL))
          OR (r.language = lang_filter)
      )
      AND (r.created_at >= NOW() - INTERVAL '30 days' OR (r.likes + r.downloads) > 0)
    ORDER BY (r.likes + r.downloads) DESC, r.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure get_top_albums_v3 exists and works correctly
DROP FUNCTION IF EXISTS get_top_albums_v3(integer, text);

CREATE OR REPLACE FUNCTION get_top_albums_v3(limit_count INTEGER DEFAULT 10, lang_filter TEXT DEFAULT 'tamil')
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
    WHERE r.status = 'approved' 
      AND r.movie_name IS NOT NULL
      AND r.audio_url IS NOT NULL AND r.audio_url != ''
      AND r.poster_url IS NOT NULL AND r.poster_url != ''
      AND (
          (lang_filter = 'tamil' AND (r.language = 'tamil' OR r.language IS NULL))
          OR (r.language = lang_filter)
      )
    GROUP BY r.movie_name
    HAVING SUM(COALESCE(r.likes, 0) + COALESCE(r.downloads, 0)) > 0
    ORDER BY total_engagement DESC, ringtone_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
