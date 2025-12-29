-- Cleanup Testnet Data from Production Database
-- Run this in Supabase SQL Editor to remove all testnet tokens/data
-- 
-- IMPORTANT: Only run this on mainnet database to clean up test data
-- Testnet addresses start with 'ST', mainnet addresses start with 'SP'

-- ============================================
-- Preview what will be deleted (run these first to verify)
-- ============================================

-- Preview testnet tokens to delete
-- SELECT id, name, symbol, creator FROM tokens WHERE creator LIKE 'ST%';

-- Preview testnet activity to delete  
-- SELECT id, event_type, address FROM activity WHERE address LIKE 'ST%';

-- Preview testnet leaderboard entries to delete
-- SELECT id, address, total_trades FROM leaderboard WHERE address LIKE 'ST%';

-- ============================================
-- DELETE TESTNET DATA (uncomment to execute)
-- ============================================

-- Step 1: Delete trades from testnet tokens
DELETE FROM trades 
WHERE token_id IN (SELECT id FROM tokens WHERE creator LIKE 'ST%');

-- Step 2: Delete activity from testnet addresses
DELETE FROM activity 
WHERE address LIKE 'ST%';

-- Step 3: Delete testnet leaderboard entries
DELETE FROM leaderboard 
WHERE address LIKE 'ST%';

-- Step 4: Delete testnet tokens
DELETE FROM tokens 
WHERE creator LIKE 'ST%';

-- ============================================
-- Verify cleanup
-- ============================================

-- Check remaining tokens (should only be mainnet SP addresses)
SELECT 'Remaining tokens:' as info, COUNT(*) as count FROM tokens;
SELECT id, name, symbol, creator FROM tokens LIMIT 10;

-- Check remaining activity
SELECT 'Remaining activity:' as info, COUNT(*) as count FROM activity;

-- Check remaining leaderboard
SELECT 'Remaining leaderboard:' as info, COUNT(*) as count FROM leaderboard;

-- ============================================
-- Optional: Reset sequences if needed
-- ============================================
-- If you want a completely fresh start, you can also truncate all tables:
-- TRUNCATE tokens, trades, activity, leaderboard CASCADE;

