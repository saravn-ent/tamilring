-- Bulk Gamification Fix for ALL Users
-- Run this in Supabase SQL Editor to instantly fix reputations and badges for everyone.

-- 1. Recalculate Points and Levels for all users based on approved uploads
WITH user_scores AS (
    SELECT 
        user_id, 
        COUNT(*) * 50 as new_points,
        (FLOOR((COUNT(*) * 50) / 500) + 1) as new_level
    FROM ringtones 
    WHERE status = 'approved' AND user_id IS NOT NULL
    GROUP BY user_id
)
UPDATE profiles p
SET 
    points = us.new_points,
    level = us.new_level
FROM user_scores us
WHERE p.id = us.user_id;

-- 2. Backfill MISSING Badges for all users
INSERT INTO user_badges (user_id, badge_id)
SELECT 
    p.id, 
    b.id
FROM profiles p
JOIN (
    SELECT user_id, COUNT(*) as upload_count 
    FROM ringtones 
    WHERE status = 'approved' AND user_id IS NOT NULL
    GROUP BY user_id
) counts ON counts.user_id = p.id
JOIN badges b ON b.condition_type = 'uploads_count' AND counts.upload_count >= b.condition_value
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- 3. (Optional) Fix NULL points for users with 0 uploads
UPDATE profiles SET points = 0, level = 1 WHERE points IS NULL;
