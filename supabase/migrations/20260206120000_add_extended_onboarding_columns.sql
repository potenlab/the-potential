-- Migration: Add extended onboarding columns to profiles table
-- Purpose: Support the new 5-step onboarding flow with detailed profile setup
-- New columns: username, nickname, bio, sub_region, sub_industry, business_type, business_stage

-- ============================================================================
-- Add new columns to profiles table
-- ============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS nickname text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS sub_region text,
  ADD COLUMN IF NOT EXISTS sub_industry text,
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS business_stage text;

-- ============================================================================
-- Unique constraint on username (for @handle)
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_idx
  ON profiles (username)
  WHERE username IS NOT NULL;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON COLUMN profiles.username IS 'Unique username handle (lowercase, numbers, _, -)';
COMMENT ON COLUMN profiles.nickname IS 'Display name shown to other users';
COMMENT ON COLUMN profiles.bio IS 'User bio/introduction (max 200 chars)';
COMMENT ON COLUMN profiles.sub_region IS 'District within the region (e.g., Gangnam-gu)';
COMMENT ON COLUMN profiles.sub_industry IS 'Sub-category within the industry';
COMMENT ON COLUMN profiles.business_type IS 'Type of business (startup, self_employed, employee, freelancer, creator, agency, professional)';
COMMENT ON COLUMN profiles.business_stage IS 'Current business stage (ideation, validation, mvp, launch_prep, early_operation, growth, expansion, stabilization)';
