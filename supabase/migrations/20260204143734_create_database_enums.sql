-- Migration: Create Database Enums and Types
-- Task 2.1 from dev-plan.md
-- Reference: backend-plan.md

-- =============================================================================
-- CORE USER ENUMS
-- =============================================================================

-- User roles enum (member, expert, admin)
CREATE TYPE user_role AS ENUM ('member', 'expert', 'admin');
COMMENT ON TYPE user_role IS 'User roles: member (default), expert (verified service provider), admin (platform administrator)';

-- Approval status enum (for member registration workflow)
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
COMMENT ON TYPE approval_status IS 'Member approval status: pending (awaiting review), approved (active), rejected (denied), suspended (temporarily disabled)';

-- =============================================================================
-- EXPERT PROFILE ENUMS
-- =============================================================================

-- Expert verification status enum
CREATE TYPE expert_status AS ENUM ('draft', 'pending_review', 'approved', 'rejected');
COMMENT ON TYPE expert_status IS 'Expert profile verification status: draft (incomplete), pending_review (submitted for review), approved (verified), rejected (not approved)';

-- Expert categories enum
CREATE TYPE expert_category AS ENUM (
  'marketing',
  'development',
  'design',
  'legal',
  'finance',
  'hr',
  'operations',
  'strategy',
  'other'
);
COMMENT ON TYPE expert_category IS 'Expert service categories for filtering and search';

-- =============================================================================
-- ENGAGEMENT ENUMS
-- =============================================================================

-- Likeable entity type (for polymorphic likes)
CREATE TYPE likeable_type AS ENUM ('post', 'comment');
COMMENT ON TYPE likeable_type IS 'Types of entities that can be liked';

-- Bookmarkable entity type (for polymorphic bookmarks)
CREATE TYPE bookmarkable_type AS ENUM ('expert_profile', 'support_program', 'post');
COMMENT ON TYPE bookmarkable_type IS 'Types of entities that can be bookmarked';

-- =============================================================================
-- SUPPORT PROGRAM ENUMS
-- =============================================================================

-- Program status enum
CREATE TYPE program_status AS ENUM ('draft', 'published', 'archived');
COMMENT ON TYPE program_status IS 'Support program publication status';

-- Program categories enum
CREATE TYPE program_category AS ENUM (
  'funding',
  'mentoring',
  'education',
  'networking',
  'space',
  'other'
);
COMMENT ON TYPE program_category IS 'Support program categories for filtering';

-- =============================================================================
-- NOTIFICATION ENUMS
-- =============================================================================

-- Notification types enum
CREATE TYPE notification_type AS ENUM (
  'member_approved',
  'member_rejected',
  'expert_approved',
  'expert_rejected',
  'new_comment',
  'new_like',
  'new_collaboration_request',
  'collaboration_accepted',
  'collaboration_declined',
  'system_announcement'
);
COMMENT ON TYPE notification_type IS 'Types of notifications sent to users';

-- =============================================================================
-- COLLABORATION ENUMS
-- =============================================================================

-- Collaboration request type enum
CREATE TYPE collaboration_type AS ENUM ('coffee_chat', 'collaboration');
COMMENT ON TYPE collaboration_type IS 'Types of collaboration requests between members and experts';

-- Collaboration request status enum
CREATE TYPE collaboration_status AS ENUM ('pending', 'accepted', 'declined', 'cancelled');
COMMENT ON TYPE collaboration_status IS 'Status of collaboration requests';
