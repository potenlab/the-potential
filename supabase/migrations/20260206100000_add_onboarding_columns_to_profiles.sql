-- Migration: Add onboarding columns to profiles table
-- Purpose: Support the new sign-up flow where users complete onboarding
-- after Google OAuth or magic link sign-up.
-- New columns: region, industry, level, onboarding_completed

-- ============================================================================
-- Add new columns to profiles table
-- ============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- ============================================================================
-- Index for admin queries on onboarding status
-- ============================================================================

CREATE INDEX IF NOT EXISTS profiles_onboarding_completed_idx
  ON profiles (onboarding_completed)
  WHERE onboarding_completed = false;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON COLUMN profiles.region IS 'User region (e.g., Seoul, Gyeonggi, etc.)';
COMMENT ON COLUMN profiles.industry IS 'User industry sector';
COMMENT ON COLUMN profiles.level IS 'User experience level (beginner, intermediate, advanced, expert)';
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether the user has completed the onboarding flow';
