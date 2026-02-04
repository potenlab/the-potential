-- Migration: Create support_programs table
-- Task 2.6: Create Support Programs Table
-- Purpose: Startup support program announcements curated by administrators
-- NOTE: RLS policies will be added in task 2.9/2.10 after helper functions are created

-- Program status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'program_status') THEN
        CREATE TYPE program_status AS ENUM ('draft', 'published', 'archived');
    END IF;
END$$;

-- Program categories enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'program_category') THEN
        CREATE TYPE program_category AS ENUM (
            'funding',
            'mentoring',
            'education',
            'networking',
            'space',
            'other'
        );
    END IF;
END$$;

-- Create support_programs table
CREATE TABLE IF NOT EXISTS support_programs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- Content
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    organization TEXT NOT NULL,
    category program_category NOT NULL,

    -- Details
    amount TEXT, -- e.g., "Up to 50M KRW", "Varies"
    eligibility TEXT,
    benefits TEXT[],

    -- Links and media
    external_url TEXT,
    image_url TEXT,

    -- Dates
    application_start TIMESTAMPTZ,
    application_deadline TIMESTAMPTZ,
    program_start TIMESTAMPTZ,
    program_end TIMESTAMPTZ,

    -- Management
    status program_status NOT NULL DEFAULT 'draft',
    created_by UUID NOT NULL REFERENCES profiles(id),

    -- Engagement
    view_count INTEGER NOT NULL DEFAULT 0,
    bookmark_count INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT valid_deadline CHECK (
        application_start IS NULL OR application_deadline IS NULL OR
        application_start <= application_deadline
    )
);

-- Comment on table
COMMENT ON TABLE support_programs IS 'Startup support programs curated by administrators';

-- Indexes for foreign keys
CREATE INDEX IF NOT EXISTS support_programs_created_by_idx ON support_programs (created_by);

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS support_programs_category_idx ON support_programs (category);
CREATE INDEX IF NOT EXISTS support_programs_status_idx ON support_programs (status);

-- Index for deadline filtering (partial index for published programs with deadlines)
CREATE INDEX IF NOT EXISTS support_programs_deadline_idx ON support_programs (application_deadline)
    WHERE status = 'published' AND application_deadline IS NOT NULL;

-- Composite index for public listing (common query pattern)
CREATE INDEX IF NOT EXISTS support_programs_public_idx ON support_programs (status, application_deadline DESC, created_at DESC)
    WHERE status = 'published';

-- Full-text search index for searching programs
CREATE INDEX IF NOT EXISTS support_programs_search_idx ON support_programs USING GIN (
    to_tsvector('simple', COALESCE(title, '') || ' ' || COALESCE(organization, '') || ' ' || COALESCE(description, ''))
);

-- Create trigger for updated_at timestamp (uses shared update_updated_at function)
DROP TRIGGER IF EXISTS support_programs_updated_at ON support_programs;
CREATE TRIGGER support_programs_updated_at
    BEFORE UPDATE ON support_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
