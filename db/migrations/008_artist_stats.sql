-- RPC to get stats for a single artist profile
CREATE OR REPLACE FUNCTION get_artist_stats(query_name TEXT)
RETURNS TABLE (
    ringtone_count BIGINT,
    movie_count BIGINT,
    total_likes BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::bigint as ringtone_count,
        COUNT(DISTINCT movie_name)::bigint as movie_count,
        COALESCE(SUM(likes), 0)::bigint as total_likes
    FROM ringtones
    WHERE status = 'approved'
      AND (
          singers ILIKE '%' || query_name || '%'
          OR music_director ILIKE '%' || query_name || '%'
          OR movie_director ILIKE '%' || query_name || '%'
          -- OR cast_members ILIKE '%' || query_name || '%' -- Add if cast_members column exists and is used
      );
END;
$$;
