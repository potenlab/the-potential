-- Migration: Create Profiles Table with Indexes
-- Task 2.2: Create profiles table with all columns, constraints, and indexes
-- Source: backend-plan.md

-- ============================================================================
-- Table: profiles
-- Purpose: Extended user profile information linked to Supabase Auth users.
--          Stores member details, role, and approval status.
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  -- Basic info
  email text not null,
  full_name text not null,
  avatar_url text,
  phone text,

  -- Professional info
  company_name text,
  job_title text,
  bio text,
  location text,

  -- Platform-specific
  role user_role not null default 'member',
  approval_status approval_status not null default 'pending',
  rejection_reason text,

  -- Profile completeness (calculated fields stored for performance)
  profile_completeness integer not null default 0,

  -- Networking
  network_count integer not null default 0,

  -- Skills/Expertise (JSONB for flexibility)
  expertise text[] default array[]::text[],
  skills text[] default array[]::text[],

  -- Collaboration needs (for matching)
  collaboration_needs jsonb default '[]'::jsonb,

  -- Experience timeline
  experience jsonb default '[]'::jsonb,

  -- Portfolio links
  portfolio_links jsonb default '[]'::jsonb,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_active_at timestamptz,

  -- Constraints
  constraint valid_email check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  constraint valid_completeness check (profile_completeness >= 0 and profile_completeness <= 100)
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Basic query indexes
create index profiles_role_idx on profiles (role);
create index profiles_approval_status_idx on profiles (approval_status);
create index profiles_created_at_idx on profiles (created_at desc);

-- GIN indexes for text search (using pg_trgm extension)
create index profiles_company_name_idx on profiles using gin (company_name gin_trgm_ops);
create index profiles_full_name_idx on profiles using gin (full_name gin_trgm_ops);

-- GIN indexes for array containment queries
create index profiles_expertise_idx on profiles using gin (expertise);
create index profiles_skills_idx on profiles using gin (skills);

-- Composite index for admin queries (pending approvals)
create index profiles_status_created_idx on profiles (approval_status, created_at desc)
  where approval_status = 'pending';

-- Full-text search index
create index profiles_search_idx on profiles using gin (
  to_tsvector('simple', coalesce(full_name, '') || ' ' || coalesce(company_name, '') || ' ' || coalesce(bio, ''))
);

-- ============================================================================
-- Comments
-- ============================================================================

comment on table profiles is 'Extended user profiles linked to Supabase Auth';
comment on column profiles.id is 'References auth.users(id) - 1:1 relationship';
comment on column profiles.role is 'User role: member, expert, or admin';
comment on column profiles.approval_status is 'Member approval status: pending, approved, rejected, suspended';
comment on column profiles.profile_completeness is 'Calculated percentage (0-100) of profile completion';
comment on column profiles.expertise is 'Array of expertise areas for matching';
comment on column profiles.skills is 'Array of skills for matching';
comment on column profiles.collaboration_needs is 'JSONB array of collaboration needs for matching';
comment on column profiles.experience is 'JSONB array of experience timeline entries';
comment on column profiles.portfolio_links is 'JSONB array of portfolio links';
