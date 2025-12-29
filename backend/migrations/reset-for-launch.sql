-- RESET DATABASE FOR PRODUCTION LAUNCH
-- Run this in Supabase SQL Editor to start fresh
-- 
-- This removes ALL test data including mainnet test tokens
-- Created: For stacks.fun production launch

-- ============================================
-- OPTION 1: DELETE ALL DATA (Clean Slate)
-- ============================================
-- This completely resets all tables to start fresh

-- Delete all trades first (foreign key dependency)
DELETE FROM trades;

-- Delete all activity
DELETE FROM activity;

-- Delete all leaderboard entries
DELETE FROM leaderboard;

-- Delete all tokens
DELETE FROM tokens;

-- Verify everything is clean
SELECT 'tokens' as table_name, COUNT(*) as count FROM tokens
UNION ALL
SELECT 'trades', COUNT(*) FROM trades
UNION ALL
SELECT 'activity', COUNT(*) FROM activity
UNION ALL
SELECT 'leaderboard', COUNT(*) FROM leaderboard;

-- ============================================
-- ALTERNATIVE: Delete specific test tokens only
-- ============================================
-- If you want to keep some data and only delete specific test tokens:
--
-- DELETE FROM trades WHERE token_id IN (
--     SELECT id FROM tokens WHERE symbol IN ('SFROG', 'BDOG')
-- );
-- DELETE FROM activity WHERE token_id IN (
--     SELECT id FROM tokens WHERE symbol IN ('SFROG', 'BDOG')
-- );
-- DELETE FROM tokens WHERE symbol IN ('SFROG', 'BDOG');

