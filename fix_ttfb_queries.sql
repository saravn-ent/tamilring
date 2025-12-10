-- Function 1: Get Top Movies by Total Likes (Aggregated)
-- Returns the movie name, total likes for that movie, and the single "best" ringtone (poster/details) for display.
CREATE OR REPLACE FUNCTION get_top_movies_by_likes(limit_count int)
RETURNS TABLE (
    movie_name text,
    total_likes bigint,
    ringtone_id uuid,
    ringtone_title text,
    ringtone_slug text,
    ringtone_poster_url text,
    ringtone_movie_year text,
    ringtone_likes bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH MovieLikes AS (
        SELECT
            r.movie_name,
            SUM(r.likes) as total_likes
        FROM ringtones r
        WHERE r.status = 'approved'
        GROUP BY r.movie_name
        ORDER BY total_likes DESC
        LIMIT limit_count
    ),
    BestRingtones AS (
        SELECT DISTINCT ON (r.movie_name)
            r.movie_name,
            r.id,
            r.title,
            r.slug,
            r.poster_url,
            r.movie_year,
            r.likes
        FROM ringtones r
        WHERE r.status = 'approved'
        ORDER BY r.movie_name, r.likes DESC
    )
    SELECT
        ml.movie_name,
        ml.total_likes,
        br.id,
        br.title,
        br.slug,
        br.poster_url,
        br.movie_year,
        br.likes
    FROM MovieLikes ml
    -- Inner join ensures we only get movies that successfully found a ringtone match
    JOIN BestRingtones br ON ml.movie_name = br.movie_name
    ORDER BY ml.total_likes DESC;
END;
$$;

-- Function 2: Get Top Contributors
-- Returns user details and their upload count
CREATE OR REPLACE FUNCTION get_top_contributors(limit_count int)
RETURNS TABLE (
    user_id uuid,
    upload_count bigint,
    full_name text,
    avatar_url text,
    points bigint,
    level bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.user_id,
        COUNT(*) as upload_count,
        p.full_name,
        p.avatar_url,
        COALESCE(p.points, 0) as points,
        COALESCE(p.level, 1) as level
    FROM ringtones r
    JOIN profiles p ON r.user_id = p.id
    WHERE r.status = 'approved'
    GROUP BY r.user_id, p.id, p.full_name, p.avatar_url, p.points, p.level
    ORDER BY upload_count DESC
    LIMIT limit_count;
END;
$$;
