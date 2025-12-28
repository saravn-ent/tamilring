-- Optimization SQL for TamilRing

-- 1. Create Missing Indexes
CREATE INDEX IF NOT EXISTS idx_ringtones_movie_year ON ringtones(movie_year);
CREATE INDEX IF NOT EXISTS idx_ringtones_status ON ringtones(status);
CREATE INDEX IF NOT EXISTS idx_ringtones_slug ON ringtones(slug);

-- 2. Create RPC for Aggregate Artist Stats
-- This replaces the expensive in-memory processing in the homepage
CREATE OR REPLACE FUNCTION get_all_people_stats()
RETURNS TABLE (
    name text,
    normalized_name text,
    total_likes bigint,
    total_count bigint,
    is_md boolean,
    is_dir boolean,
    is_singer boolean
) AS $$
BEGIN
    RETURN QUERY
    WITH expanded AS (
        SELECT trim(unnest(regexp_split_to_array(singers, '[,&]|\band\b', 'i'))) as n, likes, id, 'singer' as role FROM ringtones WHERE status = 'approved'
        UNION ALL
        SELECT trim(unnest(regexp_split_to_array(music_director, '[,&]|\band\b', 'i'))) as n, likes, id, 'md' as role FROM ringtones WHERE status = 'approved'
        UNION ALL
        SELECT trim(unnest(regexp_split_to_array(movie_director, '[,&]|\band\b', 'i'))) as n, likes, id, 'dir' as role FROM ringtones WHERE status = 'approved'
    ),
    normalized AS (
        SELECT 
            n,
            -- JS equivalent: replace(/\(.*?\)/g, '').replace(/[^a-z0-9\s]/gi, '').replace(/\b(music|director|...)\b/gi, '').replace(/\s+/g, ' ').trim().toLowerCase()
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
        bool_or(role = 'singer') as is_singer
    FROM normalized
    WHERE norm != ''
    GROUP BY norm
    ORDER BY total_likes DESC;
END;
$$ LANGUAGE plpgsql;
