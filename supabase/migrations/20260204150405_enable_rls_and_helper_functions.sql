-- Migration: Enable RLS and Create Helper Functions
-- Task 2.9: Enable RLS on all tables and create is_admin, is_approved_member, get_current_user_role helpers
-- Reference: backend-plan.md - Row Level Security (RLS) section

-- =====================================================
-- STEP 1: Enable Row Level Security on ALL tables
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: Create Helper Functions
-- These use SECURITY DEFINER with explicit search_path for performance and security
-- Reference: security-rls-performance.md best practices
-- =====================================================

-- Helper: Check if current user is an approved admin
-- Using security definer and SELECT wrapper for performance
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
    AND role = 'admin'
    AND approval_status = 'approved'
  );
$$;

-- Helper: Check if current user is an approved member (any role)
CREATE OR REPLACE FUNCTION is_approved_member()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
    AND approval_status = 'approved'
  );
$$;

-- Helper: Get current user's role
-- Named get_current_user_role to match acceptance criteria
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT role FROM public.profiles
  WHERE id = (SELECT auth.uid());
$$;

-- Also create an alias get_user_role for compatibility with backend-plan.md examples
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT role FROM public.profiles
  WHERE id = (SELECT auth.uid());
$$;

-- =====================================================
-- STEP 3: Grant execute permissions to authenticated users
-- =====================================================

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_approved_member() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON FUNCTION is_admin() IS 'Returns true if current authenticated user is an approved admin';
COMMENT ON FUNCTION is_approved_member() IS 'Returns true if current authenticated user has approved status';
COMMENT ON FUNCTION get_current_user_role() IS 'Returns the role of the current authenticated user';
COMMENT ON FUNCTION get_user_role() IS 'Alias for get_current_user_role - Returns the role of the current authenticated user';
