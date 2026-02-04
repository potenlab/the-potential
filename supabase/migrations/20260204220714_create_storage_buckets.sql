-- Migration: Create Storage Buckets and Policies
-- Task 2.11: Create storage buckets for avatars, post-media, expert-documents, portfolio, program-images
-- Reference: backend-plan.md - File Storage Strategy section

-- =====================================================
-- STEP 1: Create Storage Buckets
-- =====================================================

-- 1. avatars - Public bucket for user profile pictures
-- Users upload to their own folder (user_id/avatar.ext)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,  -- Public: accessible without auth for viewing
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. post-media - Public read bucket for community post attachments
-- Approved members can upload to their folder (user_id/timestamp-filename.ext)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-media',
  'post-media',
  true,  -- Public: viewable by anyone
  10485760,  -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. expert-documents - Private bucket for expert verification documents
-- Only owner and admins can view; experts upload to their folder
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'expert-documents',
  'expert-documents',
  false,  -- Private: requires authentication
  20971520,  -- 20MB limit for documents
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4. portfolio (expert-portfolio) - Public bucket for expert portfolio files
-- Experts can upload portfolio items to their folder
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio',
  'portfolio',
  true,  -- Public: portfolio items are viewable by everyone
  20971520,  -- 20MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 5. program-images - Public read bucket for support program images
-- Only admins can upload
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'program-images',
  'program-images',
  true,  -- Public: viewable by anyone
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- STEP 2: Create Storage RLS Policies
-- =====================================================

-- ---------------------------------
-- AVATARS BUCKET POLICIES
-- ---------------------------------

-- SELECT: Avatar images are publicly accessible (bucket is public)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- INSERT: Users can upload their own avatar (to their user_id folder)
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- UPDATE: Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- DELETE: Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- ---------------------------------
-- POST-MEDIA BUCKET POLICIES
-- ---------------------------------

-- SELECT: Post media is publicly accessible (bucket is public)
CREATE POLICY "Post media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-media');

-- INSERT: Approved members can upload post media to their folder
CREATE POLICY "Approved members can upload post media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-media'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  AND (SELECT is_approved_member())
);

-- UPDATE: Users can update their own post media
CREATE POLICY "Users can update their own post media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'post-media'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- DELETE: Users can delete their own post media
CREATE POLICY "Users can delete their own post media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-media'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- ---------------------------------
-- EXPERT-DOCUMENTS BUCKET POLICIES (Private)
-- ---------------------------------

-- SELECT: Expert documents visible to owner and admin only
CREATE POLICY "Expert documents visible to owner and admin"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'expert-documents'
  AND (
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
    OR (SELECT is_admin())
  )
);

-- INSERT: Experts can upload their verification documents
CREATE POLICY "Experts can upload verification documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'expert-documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- UPDATE: Experts can update their own documents
CREATE POLICY "Experts can update their own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'expert-documents'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- DELETE: Experts can delete their own documents, admins can delete any
CREATE POLICY "Experts can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'expert-documents'
  AND (
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
    OR (SELECT is_admin())
  )
);

-- ---------------------------------
-- PORTFOLIO BUCKET POLICIES
-- ---------------------------------

-- SELECT: Portfolio files are publicly accessible (bucket is public)
CREATE POLICY "Portfolio files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

-- INSERT: Experts can upload portfolio files to their folder
CREATE POLICY "Experts can upload portfolio files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portfolio'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  AND (SELECT is_approved_member())
);

-- UPDATE: Experts can update their own portfolio files
CREATE POLICY "Experts can update their own portfolio files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'portfolio'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- DELETE: Experts can delete their own portfolio files
CREATE POLICY "Experts can delete their own portfolio files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'portfolio'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- ---------------------------------
-- PROGRAM-IMAGES BUCKET POLICIES
-- ---------------------------------

-- SELECT: Program images are publicly accessible (bucket is public)
CREATE POLICY "Program images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'program-images');

-- INSERT: Only admins can upload program images
CREATE POLICY "Only admins can upload program images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'program-images'
  AND (SELECT is_admin())
);

-- UPDATE: Only admins can update program images
CREATE POLICY "Only admins can update program images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'program-images'
  AND (SELECT is_admin())
);

-- DELETE: Only admins can delete program images
CREATE POLICY "Only admins can delete program images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'program-images'
  AND (SELECT is_admin())
);

-- =====================================================
-- Migration Complete
-- =====================================================
--
-- Storage buckets created:
-- 1. avatars - Public, users upload to their own folder (user_id/*)
-- 2. post-media - Public read, approved members upload to their folder
-- 3. expert-documents - Private, experts upload verification docs
-- 4. portfolio - Public, experts upload portfolio files
-- 5. program-images - Public read, admins only can upload
--
-- All policies use (storage.foldername(name))[1] = auth.uid()::text
-- pattern to restrict uploads by user folder
--
