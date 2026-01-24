
-- Final EXACT Name RPC
-- Removes all hardcoded lists, "smart" detection, and honorific titles.
-- Only identifies Actors if they are explicitly present in the 'cast_members' column (synced from TMDB).

DROP FUNCTION IF EXISTS get_all_people_stats();

CREATE OR REPLACE FUNCTION get_all_people_stats()
RETURNS TABLE (
    name text,
    normalized_name text,
    total_likes bigint,
    total_count bigint,
    total_movies bigint,
    is_md boolean,
    is_dir boolean,
    is_singer boolean,
    is_actor boolean,
    is_top_actor boolean
) AS $$
BEGIN
    RETURN QUERY
    WITH expanded AS (
        SELECT trim(unnest(regexp_split_to_array(singers, '[,&]|\band\b', 'i'))) as n, likes, id, movie_name, 'singer' as role FROM ringtones WHERE status = 'approved'
        UNION ALL
        SELECT trim(unnest(regexp_split_to_array(music_director, '[,&]|\band\b', 'i'))) as n, likes, id, movie_name, 'md' as role FROM ringtones WHERE status = 'approved'
        UNION ALL
        SELECT trim(unnest(regexp_split_to_array(movie_director, '[,&]|\band\b', 'i'))) as n, likes, id, movie_name, 'dir' as role FROM ringtones WHERE status = 'approved'
        UNION ALL
        SELECT trim(unnest(regexp_split_to_array(cast_members, '[,&]|\band\b', 'i'))) as n, likes, id, movie_name, 'actor' as role FROM ringtones WHERE status = 'approved'
    ),
    normalized AS (
        SELECT 
            n,
            trim(regexp_replace(
                regexp_replace(
                    regexp_replace(
                        lower(n), 
                        '\(.*?\)', '', 'g'
                    ),
                    '[^a-z0-9\s]', '', 'g'
                ),
                '\b(music|director|composer|singer|vocals|vocal|feat|ft)\b', '', 'gi'
            )) as norm,
            likes,
            id,
            movie_name,
            role
        FROM expanded
        WHERE n IS NOT NULL AND n != ''
    ),
    aggregated AS (
        SELECT 
            MIN(n) as name, 
            norm as normalized_name,
            SUM(likes)::bigint as total_likes,
            COUNT(DISTINCT id)::bigint as total_count,
            COUNT(DISTINCT movie_name)::bigint as total_movies,
            bool_or(role = 'md') as is_md,
            bool_or(role = 'dir') as is_dir,
            bool_or(role = 'singer') as is_singer,
            bool_or(role = 'actor') as is_actor
        FROM normalized
        WHERE norm != ''
        GROUP BY norm
    )
    SELECT 
        a.name,
        a.normalized_name,
        a.total_likes,
        a.total_count,
        a.total_movies,
        a.is_md,
        a.is_dir,
        a.is_singer,
        a.is_actor,
        (
            -- NO ASSUMPTIONS: Only flags as TOP if they have high engagement and ARE an actor in your DB
            a.is_actor AND a.total_likes > 2
        ) as is_top_actor
    FROM aggregated a
    ORDER BY a.total_likes DESC;
END;
$$ LANGUAGE plpgsql;
