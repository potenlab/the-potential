-- ============================================================================
-- Migration: Fix SELECT policies for public pages
--
-- Thread and support-programs pages are publicly accessible.
-- Both anon and authenticated users need read access without requiring
-- is_approved_member() — anonymous can see content, so authenticated should too.
-- ============================================================================

-- ============================================================================
-- ANON SELECT policies (for unauthenticated users)
-- ============================================================================

CREATE POLICY IF NOT EXISTS posts_select_anon ON posts
  FOR SELECT TO anon
  USING (is_hidden = false);

CREATE POLICY IF NOT EXISTS comments_select_anon ON comments
  FOR SELECT TO anon
  USING (is_hidden = false);

CREATE POLICY IF NOT EXISTS profiles_select_anon ON profiles
  FOR SELECT TO anon
  USING (approval_status = 'approved');

CREATE POLICY IF NOT EXISTS support_programs_select_anon ON support_programs
  FOR SELECT TO anon
  USING (status = 'published');

-- ============================================================================
-- AUTHENTICATED SELECT policies (relaxed — remove is_approved_member() check)
-- All authenticated users can read public content, same as anonymous users.
-- Write/update/delete policies still require is_approved_member().
-- ============================================================================

-- Posts: all authenticated users can see non-hidden posts
DROP POLICY IF EXISTS posts_select ON posts;
CREATE POLICY posts_select ON posts
  FOR SELECT TO authenticated
  USING (
    is_hidden = false
    OR author_id = (SELECT auth.uid())
    OR (SELECT is_admin())
  );

-- Comments: all authenticated users can see non-hidden comments
DROP POLICY IF EXISTS comments_select ON comments;
CREATE POLICY comments_select ON comments
  FOR SELECT TO authenticated
  USING (
    is_hidden = false
    OR author_id = (SELECT auth.uid())
    OR (SELECT is_admin())
  );

-- Support programs: all authenticated users can see published programs
DROP POLICY IF EXISTS support_programs_select ON support_programs;
CREATE POLICY support_programs_select ON support_programs
  FOR SELECT TO authenticated
  USING (
    status = 'published'
    OR (SELECT is_admin())
  );

-- Likes: all authenticated users can see likes
DROP POLICY IF EXISTS likes_select ON likes;
CREATE POLICY likes_select ON likes
  FOR SELECT TO authenticated
  USING (true);
