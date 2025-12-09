-- 1. Recalculate and Update Points & Level for ALL Users
WITH user_stats AS (
  SELECT 
    user_id,
    COUNT(*) as approved_count
  FROM ringtones 
  WHERE status = 'approved'
  GROUP BY user_id
)
UPDATE profiles
SET 
  points = COALESCE(user_stats.approved_count, 0) * 50,
  level = FLOOR((COALESCE(user_stats.approved_count, 0) * 50) / 500) + 1
FROM user_stats
WHERE profiles.id = user_stats.user_id;

-- 2. Award Missing Badges (Backfill)
-- Selects all eligible badges for each user based on their approved upload count
-- and inserts them into user_badges if they don't already exist.

INSERT INTO user_badges (user_id, badge_id)
SELECT 
  p.id as user_id,
  b.id as badge_id
FROM profiles p
-- Get current upload counts
JOIN (
  SELECT user_id, COUNT(*) as cnt 
  FROM ringtones 
  WHERE status = 'approved' 
  GROUP BY user_id
) uc ON uc.user_id = p.id
-- Match with eligible badges
JOIN badges b ON b.condition_type = 'uploads_count' AND uc.cnt >= b.condition_value
-- Prevent duplicates
ON CONFLICT (user_id, badge_id) DO NOTHING;
