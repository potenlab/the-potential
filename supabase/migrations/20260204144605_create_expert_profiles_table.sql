-- Migration: Create Expert Profiles Table
-- Task 2.3 from dev-plan.md
-- Reference: backend-plan.md

-- =============================================================================
-- TABLE: expert_profiles
-- Purpose: Extended profile information for experts/agencies including
--          verification documents and business details.
-- =============================================================================

CREATE TABLE expert_profiles (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to profiles (1:1 relationship)
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Business info
  business_name TEXT NOT NULL,
  business_registration_number TEXT,
  category expert_category NOT NULL,
  subcategories TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Service details
  service_description TEXT,
  specialty TEXT[],
  price_range_min INTEGER,
  price_range_max INTEGER,
  service_regions TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Portfolio
  portfolio_url TEXT,
  portfolio_files TEXT[] DEFAULT ARRAY[]::TEXT[], -- Storage paths

  -- Verification
  status expert_status NOT NULL DEFAULT 'draft',
  verification_documents TEXT[] DEFAULT ARRAY[]::TEXT[], -- Storage paths
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,

  -- Visibility
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,

  -- Stats
  view_count INTEGER NOT NULL DEFAULT 0,
  contact_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,

  -- ==========================================================================
  -- CONSTRAINTS
  -- ==========================================================================

  -- Unique constraint: One expert profile per user
  CONSTRAINT unique_user_expert UNIQUE (user_id),

  -- Price range validation
  CONSTRAINT valid_price_range CHECK (
    price_range_min IS NULL OR price_range_max IS NULL OR price_range_min <= price_range_max
  )
);

-- Table comment
COMMENT ON TABLE expert_profiles IS 'Expert/agency profiles with verification workflow';

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Foreign key indexes (CRITICAL - Per schema-foreign-key-indexes.md)
CREATE INDEX expert_profiles_user_id_idx ON expert_profiles (user_id);
CREATE INDEX expert_profiles_verified_by_idx ON expert_profiles (verified_by);

-- Indexes for search and filtering
CREATE INDEX expert_profiles_category_idx ON expert_profiles (category);
CREATE INDEX expert_profiles_status_idx ON expert_profiles (status);

-- Partial indexes for common filtered queries
CREATE INDEX expert_profiles_is_featured_idx ON expert_profiles (is_featured)
  WHERE is_featured = TRUE;
CREATE INDEX expert_profiles_is_available_idx ON expert_profiles (is_available)
  WHERE is_available = TRUE;

-- Composite index for expert search (most common query pattern)
-- This is the main composite search index for filtering approved, available experts
CREATE INDEX expert_profiles_search_idx ON expert_profiles (category, status, is_available, created_at DESC)
  WHERE status = 'approved';

-- Full-text search index
CREATE INDEX expert_profiles_text_search_idx ON expert_profiles USING GIN (
  to_tsvector('simple', COALESCE(business_name, '') || ' ' || COALESCE(service_description, ''))
);

-- GIN indexes for array columns
CREATE INDEX expert_profiles_specialty_idx ON expert_profiles USING GIN (specialty);
CREATE INDEX expert_profiles_regions_idx ON expert_profiles USING GIN (service_regions);
CREATE INDEX expert_profiles_subcategories_idx ON expert_profiles USING GIN (subcategories);

-- =============================================================================
-- COLUMN COMMENTS
-- =============================================================================

COMMENT ON COLUMN expert_profiles.id IS 'Unique identifier for expert profile';
COMMENT ON COLUMN expert_profiles.user_id IS 'Reference to the user profile (1:1)';
COMMENT ON COLUMN expert_profiles.business_name IS 'Official business or agency name';
COMMENT ON COLUMN expert_profiles.business_registration_number IS 'Korean business registration number';
COMMENT ON COLUMN expert_profiles.category IS 'Primary service category';
COMMENT ON COLUMN expert_profiles.subcategories IS 'Additional service subcategories';
COMMENT ON COLUMN expert_profiles.service_description IS 'Detailed description of services offered';
COMMENT ON COLUMN expert_profiles.specialty IS 'Array of specialty areas';
COMMENT ON COLUMN expert_profiles.price_range_min IS 'Minimum price in KRW';
COMMENT ON COLUMN expert_profiles.price_range_max IS 'Maximum price in KRW';
COMMENT ON COLUMN expert_profiles.service_regions IS 'Array of regions where service is available';
COMMENT ON COLUMN expert_profiles.portfolio_url IS 'External portfolio website URL';
COMMENT ON COLUMN expert_profiles.portfolio_files IS 'Array of storage paths for portfolio files';
COMMENT ON COLUMN expert_profiles.status IS 'Verification workflow status';
COMMENT ON COLUMN expert_profiles.verification_documents IS 'Array of storage paths for verification docs';
COMMENT ON COLUMN expert_profiles.verified_at IS 'Timestamp when profile was verified';
COMMENT ON COLUMN expert_profiles.verified_by IS 'Admin who verified the profile';
COMMENT ON COLUMN expert_profiles.rejection_reason IS 'Reason for rejection if status is rejected';
COMMENT ON COLUMN expert_profiles.is_featured IS 'Whether expert is featured in listings';
COMMENT ON COLUMN expert_profiles.is_available IS 'Whether expert is currently accepting work';
COMMENT ON COLUMN expert_profiles.view_count IS 'Number of profile views';
COMMENT ON COLUMN expert_profiles.contact_count IS 'Number of contact/collaboration requests';
COMMENT ON COLUMN expert_profiles.submitted_at IS 'Timestamp when submitted for review';
