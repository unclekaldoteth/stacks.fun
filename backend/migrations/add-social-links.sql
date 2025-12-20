-- Add social links columns to existing tokens table
-- Run this in your Supabase SQL Editor

ALTER TABLE tokens ADD COLUMN IF NOT EXISTS twitter VARCHAR(255);
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS telegram VARCHAR(255);
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS website VARCHAR(255);
