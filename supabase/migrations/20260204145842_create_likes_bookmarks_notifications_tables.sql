-- Migration: Create Likes, Bookmarks, Notifications Tables
-- Task: 2.5 - Create polymorphic likes/bookmarks and notifications tables
-- Note: Enum types (likeable_type, bookmarkable_type, notification_type) were already created
--       in migration 20260204143734_create_database_enums.sql

-- ============================================
-- TABLE: likes
-- ============================================
-- Purpose: Like/reaction tracking for posts and comments.

CREATE TABLE likes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  likeable_type likeable_type NOT NULL,
  likeable_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Unique constraint: one like per user per entity
  CONSTRAINT unique_like UNIQUE (user_id, likeable_type, likeable_id)
);

-- Indexes
CREATE INDEX likes_user_id_idx ON likes (user_id);
CREATE INDEX likes_likeable_idx ON likes (likeable_type, likeable_id);

COMMENT ON TABLE likes IS 'Likes/reactions for posts and comments';

-- ============================================
-- TABLE: bookmarks
-- ============================================
-- Purpose: User bookmarks for experts and support programs.

CREATE TABLE bookmarks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bookmarkable_type bookmarkable_type NOT NULL,
  bookmarkable_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Unique constraint
  CONSTRAINT unique_bookmark UNIQUE (user_id, bookmarkable_type, bookmarkable_id)
);

-- Indexes
CREATE INDEX bookmarks_user_id_idx ON bookmarks (user_id);
CREATE INDEX bookmarks_user_type_idx ON bookmarks (user_id, bookmarkable_type, created_at DESC);

COMMENT ON TABLE bookmarks IS 'User bookmarks for various content types';

-- ============================================
-- TABLE: notifications
-- ============================================
-- Purpose: User notifications for various platform events.

CREATE TABLE notifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Content
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,

  -- Reference to related entity
  reference_type TEXT,
  reference_id TEXT,

  -- Metadata (flexible JSON for type-specific data)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Status
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_read_state CHECK (
    (is_read = false AND read_at IS NULL) OR
    (is_read = true AND read_at IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX notifications_user_id_idx ON notifications (user_id);
CREATE INDEX notifications_user_unread_idx ON notifications (user_id, created_at DESC)
  WHERE is_read = false;
CREATE INDEX notifications_user_all_idx ON notifications (user_id, created_at DESC);

COMMENT ON TABLE notifications IS 'User notifications for platform events';
