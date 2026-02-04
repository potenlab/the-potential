-- Migration: Create Posts and Comments Tables
-- Task 2.4: Posts and comments tables for thread feed
-- Reference: backend-plan.md

-- ============================================
-- FUNCTION: update_updated_at
-- Purpose: Shared function to update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TABLE: posts
-- Purpose: Thread-style community posts (Twitter/Instagram-like feed)
-- ============================================

create table posts (
  id bigint generated always as identity primary key,
  author_id uuid not null references profiles(id) on delete cascade,

  -- Content
  content text not null,
  media_urls text[] default array[]::text[],

  -- Engagement counts (denormalized for performance)
  like_count integer not null default 0,
  comment_count integer not null default 0,

  -- Moderation
  is_pinned boolean not null default false,
  is_hidden boolean not null default false,
  hidden_reason text,
  hidden_by uuid references profiles(id),

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Constraints
  constraint content_not_empty check (length(trim(content)) > 0),
  constraint content_max_length check (length(content) <= 5000)
);

-- Indexes for posts table
create index posts_author_id_idx on posts (author_id);
create index posts_hidden_by_idx on posts (hidden_by) where hidden_by is not null;

-- Index for feed pagination (cursor-based)
-- Per data-pagination.md: use created_at + id for stable cursor pagination
create index posts_feed_idx on posts (created_at desc, id desc) where is_hidden = false;

-- Index for user's own posts
create index posts_author_feed_idx on posts (author_id, created_at desc);

-- Pinned posts index
create index posts_pinned_idx on posts (is_pinned, created_at desc) where is_pinned = true;

comment on table posts is 'Thread-style community posts';

-- ============================================
-- TABLE: comments
-- Purpose: Comments and replies on posts
-- ============================================

create table comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references posts(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  parent_id bigint references comments(id) on delete cascade,

  -- Content
  content text not null,

  -- Engagement
  like_count integer not null default 0,

  -- Moderation
  is_hidden boolean not null default false,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Constraints
  constraint comments_content_not_empty check (length(trim(content)) > 0),
  constraint comments_content_max_length check (length(content) <= 2000)
);

-- Foreign key indexes (CRITICAL per schema-foreign-key-indexes.md)
create index comments_post_id_idx on comments (post_id);
create index comments_author_id_idx on comments (author_id);
create index comments_parent_id_idx on comments (parent_id) where parent_id is not null;

-- Index for loading comments on a post
create index comments_post_thread_idx on comments (post_id, created_at asc) where is_hidden = false;

comment on table comments is 'Comments and replies on posts';

-- ============================================
-- TRIGGERS: Auto-update timestamps
-- ============================================

-- Trigger for posts updated_at
create trigger posts_updated_at
  before update on posts
  for each row execute function update_updated_at();

-- Trigger for comments updated_at
create trigger comments_updated_at
  before update on comments
  for each row execute function update_updated_at();

-- ============================================
-- Apply trigger to profiles table (retroactive)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_updated_at'
  ) THEN
    CREATE TRIGGER profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
