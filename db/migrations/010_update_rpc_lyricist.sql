-- Update RPC to include ACTORS (cast_members) and LYRICISTS
DROP FUNCTION IF EXISTS get_all_people_stats();

CREATE OR REPLACE FUNCTION get_all_people_stats()
RETURNS TABLE (
    name text,
    normalized_name text,
    total_likes bigint,
    total_count bigint,
    is_md boolean,
    is_dir boolean,
    is_singer boolean,
    is_actor boolean,
    is_lyricist boolean
) AS $$
BEGIN
    RETURN QUERY
    WITH expanded AS (
        SELECT trim(unnest(regexp_split_to_array(singers, '[,&]|\band\b', 'i'))) as n, likes, id, 'singer' as role FROM ringtones WHERE status = 'approved'
        UNION ALL
        SELECT trim(unnest(regexp_split_to_array(music_director, '[,&]|\band\b', 'i'))) as n, likes, id, 'md' as role FROM ringtones WHERE status = 'approved'
        UNION ALL
        SELECT trim(unnest(regexp_split_to_array(movie_director, '[,&]|\band\b', 'i'))) as n, likes, id, 'dir' as role FROM ringtones WHERE status = 'approved'
        UNION ALL
        SELECT trim(unnest(regexp_split_to_array(cast_members, '[,&]|\band\b', 'i'))) as n, likes, id, 'actor' as role FROM ringtones WHERE status = 'approved' AND cast_members IS NOT NULL
        UNION ALL
        SELECT trim(unnest(regexp_split_to_array(lyricist, '[,&]|\band\b', 'i'))) as n, likes, id, 'lyricist' as role FROM ringtones WHERE status = 'approved' AND lyricist IS NOT NULL
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
            role
        FROM expanded
        WHERE n IS NOT NULL AND n != ''
    )
    SELECT 
        MIN(n) as name, 
        norm as normalized_name,
        SUM(likes)::bigint as total_likes,
        COUNT(DISTINCT id)::bigint as total_count,
        bool_or(role = 'md') as is_md,
        bool_or(role = 'dir') as is_dir,
        bool_or(role = 'singer') as is_singer,
        bool_or(role = 'actor') as is_actor,
        bool_or(role = 'lyricist') as is_lyricist
    FROM normalized
    WHERE norm != ''
    GROUP BY norm
    ORDER BY total_likes DESC;
END;
$$ LANGUAGE plpgsql;
