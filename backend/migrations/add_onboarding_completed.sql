-- Migration: Add onboarding_completed field to users table
-- Date: 2026-07-06

-- Add onboarding_completed column (default false for new users)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false NOT NULL;

-- Set existing users as onboarding completed (so they don't need to go through onboarding)
UPDATE users
SET onboarding_completed = true
WHERE onboarding_completed = false;

-- Add index for onboarding status queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed) WHERE onboarding_completed = false;
