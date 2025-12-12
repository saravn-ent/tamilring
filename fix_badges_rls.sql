
-- FIX BADGES RLS
-- The profile page hangs when fetching badges. This script fixes the RLS on 'badges' and 'user_badges'.

BEGIN;

-- 1. BADGES (The definitions)
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
-- Drop all potentially restrictive policies
DROP POLICY IF EXISTS "Public read badges" ON badges;
DROP POLICY IF EXISTS "Admins manage badges" ON badges;
-- simple read policy
CREATE POLICY "Public read badges" ON badges FOR SELECT USING (true);


-- 2. USER_BADGES (The assignments)
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
-- Drop all policies
DROP POLICY IF EXISTS "Everyone can view badges" ON user_badges;
DROP POLICY IF EXISTS "Admins can manage badges" ON user_badges;
DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
DROP POLICY IF EXISTS "Everyone can view user_badges" ON user_badges;
DROP POLICY IF EXISTS "Admins can manage user_badges" ON user_badges;
DROP POLICY IF EXISTS "Public read user_badges" ON user_badges;
DROP POLICY IF EXISTS "Admins manage user_badges" ON user_badges;

-- Simple READ policy (No recursion)
-- This allows anyone to see anyone's badges (needed for public profiles/leaderboards)
CREATE POLICY "Public read user_badges" ON user_badges FOR SELECT USING (true);

-- Admin WRITE policy
CREATE POLICY "Admins manage user_badges" ON user_badges FOR ALL USING (public.is_admin());

COMMIT;
