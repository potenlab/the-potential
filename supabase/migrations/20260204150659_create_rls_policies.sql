-- ============================================================================
-- Migration: Create RLS Policies for All Tables
-- Task 2.10 from progress.json
-- Reference: backend-plan.md RLS Policies section
-- ============================================================================

-- ============================================================================
-- Table: profiles - RLS Policies
-- ============================================================================

-- SELECT: Users can view approved profiles, own profile, admins can view all
CREATE POLICY profiles_select ON profiles
  FOR SELECT
  TO authenticated
  USING (
    approval_status = 'approved'
    OR id = (SELECT auth.uid())
    OR (SELECT is_admin())
  );

-- INSERT: Only through trigger (handled by auth signup)
-- No direct insert policy needed - the handle_new_user() trigger handles this

-- UPDATE: Users can update own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- UPDATE: Admins can update any profile
CREATE POLICY profiles_update_admin ON profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

-- DELETE: Only admins can delete profiles
CREATE POLICY profiles_delete ON profiles
  FOR DELETE
  TO authenticated
  USING ((SELECT is_admin()));

-- ============================================================================
-- Table: expert_profiles - RLS Policies
-- ============================================================================

-- SELECT: Approved experts visible to approved members, own profile always visible
CREATE POLICY expert_profiles_select ON expert_profiles
  FOR SELECT
  TO authenticated
  USING (
    (status = 'approved' AND (SELECT is_approved_member()))
    OR user_id = (SELECT auth.uid())
    OR (SELECT is_admin())
  );

-- INSERT: Approved members can create their own expert profile
CREATE POLICY expert_profiles_insert ON expert_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (SELECT is_approved_member())
  );

-- UPDATE: Own profile
CREATE POLICY expert_profiles_update_own ON expert_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- UPDATE: Admin can update any
CREATE POLICY expert_profiles_update_admin ON expert_profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin()));

-- DELETE: Only admins
CREATE POLICY expert_profiles_delete ON expert_profiles
  FOR DELETE
  TO authenticated
  USING ((SELECT is_admin()));

-- ============================================================================
-- Table: posts - RLS Policies
-- ============================================================================

-- SELECT: Approved members can see non-hidden posts, authors see their own, admins see all
CREATE POLICY posts_select ON posts
  FOR SELECT
  TO authenticated
  USING (
    (is_hidden = false AND (SELECT is_approved_member()))
    OR author_id = (SELECT auth.uid())
    OR (SELECT is_admin())
  );

-- INSERT: Approved members can create posts
CREATE POLICY posts_insert ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = (SELECT auth.uid())
    AND (SELECT is_approved_member())
  );

-- UPDATE: Own posts (without changing moderation fields)
CREATE POLICY posts_update_own ON posts
  FOR UPDATE
  TO authenticated
  USING (author_id = (SELECT auth.uid()))
  WITH CHECK (author_id = (SELECT auth.uid()));

-- UPDATE: Admin can update any post (including moderation fields)
CREATE POLICY posts_update_admin ON posts
  FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin()));

-- DELETE: Own posts or admin
CREATE POLICY posts_delete ON posts
  FOR DELETE
  TO authenticated
  USING (
    author_id = (SELECT auth.uid())
    OR (SELECT is_admin())
  );

-- ============================================================================
-- Table: comments - RLS Policies
-- ============================================================================

-- SELECT: Approved members can see non-hidden comments
CREATE POLICY comments_select ON comments
  FOR SELECT
  TO authenticated
  USING (
    (is_hidden = false AND (SELECT is_approved_member()))
    OR author_id = (SELECT auth.uid())
    OR (SELECT is_admin())
  );

-- INSERT: Approved members can comment
CREATE POLICY comments_insert ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = (SELECT auth.uid())
    AND (SELECT is_approved_member())
  );

-- UPDATE: Own comments
CREATE POLICY comments_update ON comments
  FOR UPDATE
  TO authenticated
  USING (author_id = (SELECT auth.uid()))
  WITH CHECK (author_id = (SELECT auth.uid()));

-- DELETE: Own comments or admin
CREATE POLICY comments_delete ON comments
  FOR DELETE
  TO authenticated
  USING (
    author_id = (SELECT auth.uid())
    OR (SELECT is_admin())
  );

-- ============================================================================
-- Table: likes - RLS Policies
-- ============================================================================

-- SELECT: Approved members can see likes, or own likes
CREATE POLICY likes_select ON likes
  FOR SELECT
  TO authenticated
  USING ((SELECT is_approved_member()) OR user_id = (SELECT auth.uid()));

-- INSERT: Approved members can like
CREATE POLICY likes_insert ON likes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (SELECT is_approved_member())
  );

-- DELETE: Own likes only
CREATE POLICY likes_delete ON likes
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- Table: bookmarks - RLS Policies
-- ============================================================================

-- SELECT: Own bookmarks only
CREATE POLICY bookmarks_select ON bookmarks
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- INSERT: Own bookmarks, must be approved
CREATE POLICY bookmarks_insert ON bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (SELECT is_approved_member())
  );

-- DELETE: Own bookmarks
CREATE POLICY bookmarks_delete ON bookmarks
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- Table: notifications - RLS Policies
-- ============================================================================

-- SELECT: Own notifications only
CREATE POLICY notifications_select ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- INSERT: System/admin only (via service role or triggers)
-- No direct insert for regular users

-- UPDATE: Own notifications (mark as read)
CREATE POLICY notifications_update ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- DELETE: Admin only
CREATE POLICY notifications_delete ON notifications
  FOR DELETE
  TO authenticated
  USING ((SELECT is_admin()));

-- ============================================================================
-- Table: support_programs - RLS Policies
-- ============================================================================

-- SELECT: Published programs visible to approved members, draft/archived to admins
CREATE POLICY support_programs_select ON support_programs
  FOR SELECT
  TO authenticated
  USING (
    (status = 'published' AND (SELECT is_approved_member()))
    OR (SELECT is_admin())
  );

-- INSERT: Admins only
CREATE POLICY support_programs_insert ON support_programs
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT is_admin()));

-- UPDATE: Admins only
CREATE POLICY support_programs_update ON support_programs
  FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin()));

-- DELETE: Admins only
CREATE POLICY support_programs_delete ON support_programs
  FOR DELETE
  TO authenticated
  USING ((SELECT is_admin()));

-- ============================================================================
-- Table: collaboration_requests - RLS Policies
-- ============================================================================

-- SELECT: Own requests (sent or received), admins see all
CREATE POLICY collab_requests_select ON collaboration_requests
  FOR SELECT
  TO authenticated
  USING (
    sender_id = (SELECT auth.uid())
    OR recipient_id = (SELECT auth.uid())
    OR (SELECT is_admin())
  );

-- INSERT: Approved members can send
CREATE POLICY collab_requests_insert ON collaboration_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND (SELECT is_approved_member())
  );

-- UPDATE: Recipient can respond (when pending), sender can cancel (when pending)
CREATE POLICY collab_requests_update ON collaboration_requests
  FOR UPDATE
  TO authenticated
  USING (
    (recipient_id = (SELECT auth.uid()) AND status = 'pending')
    OR (sender_id = (SELECT auth.uid()) AND status = 'pending')
  );

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON POLICY profiles_select ON profiles IS 'Users can view approved profiles, their own profile, or all if admin';
COMMENT ON POLICY profiles_update_own ON profiles IS 'Users can update their own profile';
COMMENT ON POLICY profiles_update_admin ON profiles IS 'Admins can update any profile';
COMMENT ON POLICY profiles_delete ON profiles IS 'Only admins can delete profiles';

COMMENT ON POLICY expert_profiles_select ON expert_profiles IS 'Approved experts visible to approved members, own profile always visible, admins see all';
COMMENT ON POLICY expert_profiles_insert ON expert_profiles IS 'Approved members can create their own expert profile';
COMMENT ON POLICY expert_profiles_update_own ON expert_profiles IS 'Users can update their own expert profile';
COMMENT ON POLICY expert_profiles_update_admin ON expert_profiles IS 'Admins can update any expert profile';
COMMENT ON POLICY expert_profiles_delete ON expert_profiles IS 'Only admins can delete expert profiles';

COMMENT ON POLICY posts_select ON posts IS 'Non-hidden posts visible to approved members, authors see own hidden posts, admins see all';
COMMENT ON POLICY posts_insert ON posts IS 'Approved members can create posts';
COMMENT ON POLICY posts_update_own ON posts IS 'Authors can update their own posts';
COMMENT ON POLICY posts_update_admin ON posts IS 'Admins can update any post including moderation';
COMMENT ON POLICY posts_delete ON posts IS 'Authors can delete own posts, admins can delete any';

COMMENT ON POLICY comments_select ON comments IS 'Non-hidden comments visible to approved members';
COMMENT ON POLICY comments_insert ON comments IS 'Approved members can comment';
COMMENT ON POLICY comments_update ON comments IS 'Authors can update their own comments';
COMMENT ON POLICY comments_delete ON comments IS 'Authors can delete own comments, admins can delete any';

COMMENT ON POLICY likes_select ON likes IS 'Approved members can see likes';
COMMENT ON POLICY likes_insert ON likes IS 'Approved members can like content';
COMMENT ON POLICY likes_delete ON likes IS 'Users can only remove their own likes';

COMMENT ON POLICY bookmarks_select ON bookmarks IS 'Users can only see their own bookmarks';
COMMENT ON POLICY bookmarks_insert ON bookmarks IS 'Approved members can create bookmarks';
COMMENT ON POLICY bookmarks_delete ON bookmarks IS 'Users can only delete their own bookmarks';

COMMENT ON POLICY notifications_select ON notifications IS 'Users can only see their own notifications';
COMMENT ON POLICY notifications_update ON notifications IS 'Users can mark their own notifications as read';
COMMENT ON POLICY notifications_delete ON notifications IS 'Only admins can delete notifications';

COMMENT ON POLICY support_programs_select ON support_programs IS 'Published programs visible to approved members, all visible to admins';
COMMENT ON POLICY support_programs_insert ON support_programs IS 'Only admins can create support programs';
COMMENT ON POLICY support_programs_update ON support_programs IS 'Only admins can update support programs';
COMMENT ON POLICY support_programs_delete ON support_programs IS 'Only admins can delete support programs';

COMMENT ON POLICY collab_requests_select ON collaboration_requests IS 'Senders and recipients can see their own requests';
COMMENT ON POLICY collab_requests_insert ON collaboration_requests IS 'Approved members can send collaboration requests';
COMMENT ON POLICY collab_requests_update ON collaboration_requests IS 'Involved parties can update pending requests';
