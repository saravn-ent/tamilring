-- Enable pg_trgm extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create a function to check for near-duplicates
CREATE OR REPLACE FUNCTION check_for_duplicates(
    p_title TEXT,
    p_movie_name TEXT,
    p_duration INTEGER,
    p_audio_hash TEXT,
    p_acoustic_fingerprint TEXT
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    movie_name TEXT,
    match_type TEXT
) AS $$
BEGIN
    -- 1. Exact Audio Hash Match
    RETURN QUERY
    SELECT r.id, r.title, r.movie_name, 'exact_hash'::TEXT
    FROM ringtones r
    WHERE r.audio_hash = p_audio_hash;

    IF FOUND THEN RETURN; END IF;

    -- 2. Exact Metadata + Similar Duration Match
    RETURN QUERY
    SELECT r.id, r.title, r.movie_name, 'metadata_duration'::TEXT
    FROM ringtones r
    WHERE r.movie_name = p_movie_name 
      AND (r.song_name = p_title OR r.title = p_title)
      AND ABS(r.duration - p_duration) <= 1; -- 1 second tolerance

    IF FOUND THEN RETURN; END IF;

    -- 3. Acoustic Fingerprint Match (Similar Sound)
    IF p_acoustic_fingerprint IS NOT NULL THEN
        RETURN QUERY
        SELECT r.id, r.title, r.movie_name, 'acoustic_fingerprint'::TEXT
        FROM ringtones r
        WHERE r.acoustic_fingerprint = p_acoustic_fingerprint;
        
        IF FOUND THEN RETURN; END IF;
    END IF;

    -- 4. Fuzzy Metadata Match (Catching re-uploads with slightly different names)
    RETURN QUERY
    SELECT r.id, r.title, r.movie_name, 'fuzzy_metadata'::TEXT
    FROM ringtones r
    WHERE (r.title % p_title OR r.movie_name % p_movie_name)
      AND ABS(r.duration - p_duration) <= 3 -- Must be somewhat similar in length
    LIMIT 1;

END;
$$ LANGUAGE plpgsql;
