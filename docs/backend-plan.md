# Backend Plan - The Potential

Generated: 2026-02-04
Source PRD: /docs/prd.md
UI/UX Reference: /docs/ui-ux-plan.md
Platform: Supabase (PostgreSQL)

---

## Overview

The Potential is a trust-based platform for early-stage startup founders, providing:
- **Verified expert/agency matching** with complex search and verification workflows
- **Thread-style community feed** for real-time communication and networking
- **Support program curation** managed by administrators
- **Member management** with approval-based registration

This backend plan defines the database schema, RLS policies, API design, and optimization strategies following Supabase Postgres best practices.

---

## Current Database State

**Status:** New Supabase project (fresh database assumed)

### Expected Supabase Default Schemas
| Schema | Description |
|--------|-------------|
| public | Application tables |
| auth | Supabase Auth (managed) |
| storage | File storage metadata (managed) |
| realtime | Real-time subscriptions (managed) |

### Gap Analysis
| PRD Requirement | Current State | Action Needed |
|-----------------|---------------|---------------|
| User profiles with roles | Missing | Create `profiles` table |
| Expert profiles | Missing | Create `expert_profiles` table |
| Community posts | Missing | Create `posts` table |
| Comments | Missing | Create `comments` table |
| Likes/reactions | Missing | Create `likes` table |
| Support programs | Missing | Create `support_programs` table |
| Bookmarks | Missing | Create `bookmarks` table |
| Notifications | Missing | Create `notifications` table |
| File storage | Missing | Configure storage buckets |

---

## Database Schema

### Extensions Required

```sql
-- Enable required extensions
create extension if not exists "pg_trgm";      -- For text search
create extension if not exists "unaccent";      -- For accent-insensitive search
```

**Note:** UUIDv7 extension (`pg_uuidv7`) is not available in Supabase by default. We'll use `gen_random_uuid()` (UUIDv4) which is acceptable for our scale, or use `bigint identity` for tables with high insert rates.

---

### Table: profiles

**Purpose:** Extended user profile information linked to Supabase Auth users. Stores member details, role, and approval status.

**Best Practice Reference:**
- `@~/.claude/skills/supabase-postgres-best-practices/references/schema-primary-keys.md`
- `@~/.claude/skills/supabase-postgres-best-practices/references/schema-data-types.md`

```sql
-- User roles enum
create type user_role as enum ('member', 'expert', 'admin');

-- Approval status enum
create type approval_status as enum ('pending', 'approved', 'rejected', 'suspended');

-- Profiles table
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

-- Indexes
create index profiles_role_idx on profiles (role);
create index profiles_approval_status_idx on profiles (approval_status);
create index profiles_created_at_idx on profiles (created_at desc);
create index profiles_company_name_idx on profiles using gin (company_name gin_trgm_ops);
create index profiles_full_name_idx on profiles using gin (full_name gin_trgm_ops);
create index profiles_expertise_idx on profiles using gin (expertise);
create index profiles_skills_idx on profiles using gin (skills);

-- Composite index for admin queries (pending approvals)
create index profiles_status_created_idx on profiles (approval_status, created_at desc)
  where approval_status = 'pending';

-- Full-text search index
create index profiles_search_idx on profiles using gin (
  to_tsvector('simple', coalesce(full_name, '') || ' ' || coalesce(company_name, '') || ' ' || coalesce(bio, ''))
);

comment on table profiles is 'Extended user profiles linked to Supabase Auth';
```

**Design Decisions:**
- UUID PK references auth.users for 1:1 relationship - Per schema-primary-keys.md
- TIMESTAMPTZ for all timestamps - Per schema-data-types.md (timezone-aware)
- TEXT instead of VARCHAR for flexible strings - Per schema-data-types.md
- JSONB for nested/flexible data (experience, portfolio) - Allows schema evolution
- Array types for tags (expertise, skills) - Better performance than JSONB for simple lists
- GIN indexes for text search and array containment - Per advanced-jsonb-indexing.md

---

### Table: expert_profiles

**Purpose:** Extended profile information for experts/agencies including verification documents and business details.

**Best Practice Reference:**
- `@~/.claude/skills/supabase-postgres-best-practices/references/schema-foreign-key-indexes.md`

```sql
-- Expert verification status
create type expert_status as enum ('draft', 'pending_review', 'approved', 'rejected');

-- Expert categories
create type expert_category as enum (
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

create table expert_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,

  -- Business info
  business_name text not null,
  business_registration_number text,
  category expert_category not null,
  subcategories text[] default array[]::text[],

  -- Service details
  service_description text,
  specialty text[],
  price_range_min integer,
  price_range_max integer,
  service_regions text[] default array[]::text[],

  -- Portfolio
  portfolio_url text,
  portfolio_files text[] default array[]::text[], -- Storage paths

  -- Verification
  status expert_status not null default 'draft',
  verification_documents text[] default array[]::text[], -- Storage paths
  verified_at timestamptz,
  verified_by uuid references profiles(id),
  rejection_reason text,

  -- Visibility
  is_featured boolean not null default false,
  is_available boolean not null default true,

  -- Stats
  view_count integer not null default 0,
  contact_count integer not null default 0,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,

  -- Constraints
  constraint unique_user_expert unique (user_id),
  constraint valid_price_range check (
    price_range_min is null or price_range_max is null or price_range_min <= price_range_max
  )
);

-- Indexes for foreign keys (CRITICAL - Per schema-foreign-key-indexes.md)
create index expert_profiles_user_id_idx on expert_profiles (user_id);
create index expert_profiles_verified_by_idx on expert_profiles (verified_by);

-- Indexes for search and filtering
create index expert_profiles_category_idx on expert_profiles (category);
create index expert_profiles_status_idx on expert_profiles (status);
create index expert_profiles_is_featured_idx on expert_profiles (is_featured) where is_featured = true;
create index expert_profiles_is_available_idx on expert_profiles (is_available) where is_available = true;

-- Composite index for expert search (most common query pattern)
create index expert_profiles_search_idx on expert_profiles (category, status, is_available, created_at desc)
  where status = 'approved';

-- Full-text search
create index expert_profiles_text_search_idx on expert_profiles using gin (
  to_tsvector('simple', coalesce(business_name, '') || ' ' || coalesce(service_description, ''))
);

-- GIN index for specialty array
create index expert_profiles_specialty_idx on expert_profiles using gin (specialty);
create index expert_profiles_regions_idx on expert_profiles using gin (service_regions);

comment on table expert_profiles is 'Expert/agency profiles with verification workflow';
```

**Design Decisions:**
- Separate table from profiles for clean separation of concerns
- ENUM for category ensures data integrity and efficient indexing
- Array types for multi-value fields (specialty, regions)
- Partial indexes for common filtered queries (approved, featured)
- Foreign key indexes created explicitly - Per schema-foreign-key-indexes.md

---

### Table: posts

**Purpose:** Thread-style community posts (Twitter/Instagram-like feed).

**Best Practice Reference:**
- `@~/.claude/skills/supabase-postgres-best-practices/references/data-pagination.md`

```sql
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

-- Indexes
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
```

**Design Decisions:**
- BIGINT IDENTITY for high-volume inserts - Per schema-primary-keys.md (sequential, no fragmentation)
- Denormalized counts for feed performance (updated via triggers)
- Composite index on (created_at desc, id desc) for cursor pagination - Per data-pagination.md
- Partial indexes to exclude hidden posts from feed queries

---

### Table: comments

**Purpose:** Comments and replies on posts.

```sql
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
  constraint content_not_empty check (length(trim(content)) > 0),
  constraint content_max_length check (length(content) <= 2000)
);

-- Foreign key indexes (CRITICAL)
create index comments_post_id_idx on comments (post_id);
create index comments_author_id_idx on comments (author_id);
create index comments_parent_id_idx on comments (parent_id) where parent_id is not null;

-- Index for loading comments on a post
create index comments_post_thread_idx on comments (post_id, created_at asc) where is_hidden = false;

comment on table comments is 'Comments and replies on posts';
```

---

### Table: likes

**Purpose:** Like/reaction tracking for posts and comments.

```sql
-- Likeable entity type
create type likeable_type as enum ('post', 'comment');

create table likes (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  likeable_type likeable_type not null,
  likeable_id bigint not null,
  created_at timestamptz not null default now(),

  -- Unique constraint: one like per user per entity
  constraint unique_like unique (user_id, likeable_type, likeable_id)
);

-- Indexes
create index likes_user_id_idx on likes (user_id);
create index likes_likeable_idx on likes (likeable_type, likeable_id);

comment on table likes is 'Likes/reactions for posts and comments';
```

**Design Decisions:**
- Polymorphic design with type enum for flexibility
- Unique constraint prevents duplicate likes
- Triggers will update denormalized counts on posts/comments

---

### Table: support_programs

**Purpose:** Startup support program announcements curated by administrators.

```sql
-- Program status
create type program_status as enum ('draft', 'published', 'archived');

-- Program categories
create type program_category as enum (
  'funding',
  'mentoring',
  'education',
  'networking',
  'space',
  'other'
);

create table support_programs (
  id bigint generated always as identity primary key,

  -- Content
  title text not null,
  description text not null,
  organization text not null,
  category program_category not null,

  -- Details
  amount text, -- e.g., "Up to 50M KRW", "Varies"
  eligibility text,
  benefits text[],

  -- Links and media
  external_url text,
  image_url text,

  -- Dates
  application_start timestamptz,
  application_deadline timestamptz,
  program_start timestamptz,
  program_end timestamptz,

  -- Management
  status program_status not null default 'draft',
  created_by uuid not null references profiles(id),

  -- Engagement
  view_count integer not null default 0,
  bookmark_count integer not null default 0,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,

  -- Constraints
  constraint valid_deadline check (
    application_start is null or application_deadline is null or
    application_start <= application_deadline
  )
);

-- Indexes
create index support_programs_created_by_idx on support_programs (created_by);
create index support_programs_category_idx on support_programs (category);
create index support_programs_status_idx on support_programs (status);
create index support_programs_deadline_idx on support_programs (application_deadline)
  where status = 'published' and application_deadline is not null;

-- Composite index for public listing
create index support_programs_public_idx on support_programs (status, application_deadline desc, created_at desc)
  where status = 'published';

-- Full-text search
create index support_programs_search_idx on support_programs using gin (
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(organization, '') || ' ' || coalesce(description, ''))
);

comment on table support_programs is 'Startup support programs curated by administrators';
```

---

### Table: bookmarks

**Purpose:** User bookmarks for experts and support programs.

```sql
-- Bookmarkable entity type
create type bookmarkable_type as enum ('expert_profile', 'support_program', 'post');

create table bookmarks (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  bookmarkable_type bookmarkable_type not null,
  bookmarkable_id bigint not null,
  created_at timestamptz not null default now(),

  -- Unique constraint
  constraint unique_bookmark unique (user_id, bookmarkable_type, bookmarkable_id)
);

-- Indexes
create index bookmarks_user_id_idx on bookmarks (user_id);
create index bookmarks_user_type_idx on bookmarks (user_id, bookmarkable_type, created_at desc);

comment on table bookmarks is 'User bookmarks for various content types';
```

---

### Table: notifications

**Purpose:** User notifications for various platform events.

```sql
-- Notification types
create type notification_type as enum (
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

create table notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,

  -- Content
  type notification_type not null,
  title text not null,
  body text,

  -- Reference to related entity
  reference_type text,
  reference_id text,

  -- Metadata (flexible JSON for type-specific data)
  metadata jsonb default '{}'::jsonb,

  -- Status
  is_read boolean not null default false,
  read_at timestamptz,

  -- Timestamps
  created_at timestamptz not null default now(),

  -- Constraints
  constraint valid_read_state check (
    (is_read = false and read_at is null) or
    (is_read = true and read_at is not null)
  )
);

-- Indexes
create index notifications_user_id_idx on notifications (user_id);
create index notifications_user_unread_idx on notifications (user_id, created_at desc)
  where is_read = false;
create index notifications_user_all_idx on notifications (user_id, created_at desc);

comment on table notifications is 'User notifications for platform events';
```

---

### Table: collaboration_requests

**Purpose:** Collaboration proposals and coffee chat requests between members and experts.

```sql
-- Request type
create type collaboration_type as enum ('coffee_chat', 'collaboration');

-- Request status
create type collaboration_status as enum ('pending', 'accepted', 'declined', 'cancelled');

create table collaboration_requests (
  id bigint generated always as identity primary key,

  -- Parties
  sender_id uuid not null references profiles(id) on delete cascade,
  recipient_id uuid not null references profiles(id) on delete cascade,
  expert_profile_id uuid references expert_profiles(id) on delete set null,

  -- Request details
  type collaboration_type not null,
  subject text not null,
  message text not null,
  contact_info text,

  -- Status
  status collaboration_status not null default 'pending',
  response_message text,
  responded_at timestamptz,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Constraints
  constraint different_parties check (sender_id != recipient_id)
);

-- Indexes
create index collab_requests_sender_idx on collaboration_requests (sender_id);
create index collab_requests_recipient_idx on collaboration_requests (recipient_id);
create index collab_requests_expert_idx on collaboration_requests (expert_profile_id);
create index collab_requests_status_idx on collaboration_requests (status);

-- Composite for inbox queries
create index collab_requests_inbox_idx on collaboration_requests (recipient_id, status, created_at desc);

comment on table collaboration_requests is 'Collaboration and coffee chat requests';
```

---

## Triggers and Functions

### Auto-update timestamps

```sql
-- Function to update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all tables with updated_at
create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger expert_profiles_updated_at
  before update on expert_profiles
  for each row execute function update_updated_at();

create trigger posts_updated_at
  before update on posts
  for each row execute function update_updated_at();

create trigger comments_updated_at
  before update on comments
  for each row execute function update_updated_at();

create trigger support_programs_updated_at
  before update on support_programs
  for each row execute function update_updated_at();

create trigger collaboration_requests_updated_at
  before update on collaboration_requests
  for each row execute function update_updated_at();
```

### Like count management

```sql
-- Function to update like counts
create or replace function update_like_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    if new.likeable_type = 'post' then
      update posts set like_count = like_count + 1 where id = new.likeable_id;
    elsif new.likeable_type = 'comment' then
      update comments set like_count = like_count + 1 where id = new.likeable_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.likeable_type = 'post' then
      update posts set like_count = greatest(0, like_count - 1) where id = old.likeable_id;
    elsif old.likeable_type = 'comment' then
      update comments set like_count = greatest(0, like_count - 1) where id = old.likeable_id;
    end if;
    return old;
  end if;
end;
$$ language plpgsql;

create trigger likes_count_trigger
  after insert or delete on likes
  for each row execute function update_like_count();
```

### Comment count management

```sql
-- Function to update comment counts
create or replace function update_comment_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update posts set comment_count = comment_count + 1 where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update posts set comment_count = greatest(0, comment_count - 1) where id = old.post_id;
    return old;
  end if;
end;
$$ language plpgsql;

create trigger comments_count_trigger
  after insert or delete on comments
  for each row execute function update_comment_count();
```

### Profile creation on signup

```sql
-- Function to create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

---

## Row Level Security (RLS)

### Enable RLS on all tables

```sql
alter table profiles enable row level security;
alter table expert_profiles enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;
alter table support_programs enable row level security;
alter table bookmarks enable row level security;
alter table notifications enable row level security;
alter table collaboration_requests enable row level security;
```

### Helper Functions

**Best Practice Reference:** `@~/.claude/skills/supabase-postgres-best-practices/references/security-rls-performance.md`

```sql
-- Helper: Check if user is admin
-- Using security definer and SELECT wrapper for performance
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
    and role = 'admin'
    and approval_status = 'approved'
  );
$$;

-- Helper: Check if user is approved member
create or replace function is_approved_member()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
    and approval_status = 'approved'
  );
$$;

-- Helper: Get current user's role
create or replace function get_user_role()
returns user_role
language sql
security definer
set search_path = ''
stable
as $$
  select role from public.profiles
  where id = (select auth.uid());
$$;
```

### Table: profiles - RLS Policies

```sql
-- SELECT: Users can view approved profiles, admins can view all
create policy profiles_select on profiles
  for select
  to authenticated
  using (
    approval_status = 'approved'
    or id = (select auth.uid())
    or (select is_admin())
  );

-- INSERT: Only through trigger (handled by auth signup)
-- No direct insert policy needed

-- UPDATE: Users can update own profile, admins can update any
create policy profiles_update_own on profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy profiles_update_admin on profiles
  for update
  to authenticated
  using ((select is_admin()))
  with check ((select is_admin()));

-- DELETE: Only admins can delete profiles
create policy profiles_delete on profiles
  for delete
  to authenticated
  using ((select is_admin()));
```

### Table: expert_profiles - RLS Policies

```sql
-- SELECT: Approved experts visible to approved members, own profile always visible
create policy expert_profiles_select on expert_profiles
  for select
  to authenticated
  using (
    (status = 'approved' and (select is_approved_member()))
    or user_id = (select auth.uid())
    or (select is_admin())
  );

-- INSERT: Approved members can create their own expert profile
create policy expert_profiles_insert on expert_profiles
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (select is_approved_member())
  );

-- UPDATE: Own profile or admin
create policy expert_profiles_update_own on expert_profiles
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy expert_profiles_update_admin on expert_profiles
  for update
  to authenticated
  using ((select is_admin()));

-- DELETE: Only admins
create policy expert_profiles_delete on expert_profiles
  for delete
  to authenticated
  using ((select is_admin()));
```

### Table: posts - RLS Policies

```sql
-- SELECT: Approved members can see non-hidden posts
create policy posts_select on posts
  for select
  to authenticated
  using (
    (is_hidden = false and (select is_approved_member()))
    or author_id = (select auth.uid())
    or (select is_admin())
  );

-- INSERT: Approved members can create posts
create policy posts_insert on posts
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and (select is_approved_member())
  );

-- UPDATE: Own posts or admin
create policy posts_update_own on posts
  for update
  to authenticated
  using (author_id = (select auth.uid()))
  with check (
    author_id = (select auth.uid())
    -- Cannot change is_hidden, is_pinned as regular user
    and is_hidden = (select is_hidden from posts where id = posts.id)
    and is_pinned = (select is_pinned from posts where id = posts.id)
  );

create policy posts_update_admin on posts
  for update
  to authenticated
  using ((select is_admin()));

-- DELETE: Own posts or admin
create policy posts_delete on posts
  for delete
  to authenticated
  using (
    author_id = (select auth.uid())
    or (select is_admin())
  );
```

### Table: comments - RLS Policies

```sql
-- SELECT: Approved members can see non-hidden comments
create policy comments_select on comments
  for select
  to authenticated
  using (
    (is_hidden = false and (select is_approved_member()))
    or author_id = (select auth.uid())
    or (select is_admin())
  );

-- INSERT: Approved members can comment
create policy comments_insert on comments
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and (select is_approved_member())
  );

-- UPDATE: Own comments
create policy comments_update on comments
  for update
  to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

-- DELETE: Own comments or admin
create policy comments_delete on comments
  for delete
  to authenticated
  using (
    author_id = (select auth.uid())
    or (select is_admin())
  );
```

### Table: likes - RLS Policies

```sql
-- SELECT: Approved members can see likes
create policy likes_select on likes
  for select
  to authenticated
  using ((select is_approved_member()) or user_id = (select auth.uid()));

-- INSERT: Approved members can like
create policy likes_insert on likes
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (select is_approved_member())
  );

-- DELETE: Own likes only
create policy likes_delete on likes
  for delete
  to authenticated
  using (user_id = (select auth.uid()));
```

### Table: support_programs - RLS Policies

```sql
-- SELECT: Published programs visible to all authenticated, draft/archived to admins
create policy support_programs_select on support_programs
  for select
  to authenticated
  using (
    status = 'published'
    or (select is_admin())
  );

-- INSERT: Admins only
create policy support_programs_insert on support_programs
  for insert
  to authenticated
  with check ((select is_admin()));

-- UPDATE: Admins only
create policy support_programs_update on support_programs
  for update
  to authenticated
  using ((select is_admin()));

-- DELETE: Admins only
create policy support_programs_delete on support_programs
  for delete
  to authenticated
  using ((select is_admin()));
```

### Table: bookmarks - RLS Policies

```sql
-- SELECT: Own bookmarks
create policy bookmarks_select on bookmarks
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- INSERT: Own bookmarks, must be approved
create policy bookmarks_insert on bookmarks
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (select is_approved_member())
  );

-- DELETE: Own bookmarks
create policy bookmarks_delete on bookmarks
  for delete
  to authenticated
  using (user_id = (select auth.uid()));
```

### Table: notifications - RLS Policies

```sql
-- SELECT: Own notifications
create policy notifications_select on notifications
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- INSERT: System/admin only (via service role or triggers)
-- No direct insert for users

-- UPDATE: Own notifications (mark as read)
create policy notifications_update on notifications
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- DELETE: Admin only
create policy notifications_delete on notifications
  for delete
  to authenticated
  using ((select is_admin()));
```

### Table: collaboration_requests - RLS Policies

```sql
-- SELECT: Own requests (sent or received)
create policy collab_requests_select on collaboration_requests
  for select
  to authenticated
  using (
    sender_id = (select auth.uid())
    or recipient_id = (select auth.uid())
    or (select is_admin())
  );

-- INSERT: Approved members can send
create policy collab_requests_insert on collaboration_requests
  for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and (select is_approved_member())
  );

-- UPDATE: Recipient can respond, sender can cancel
create policy collab_requests_update on collaboration_requests
  for update
  to authenticated
  using (
    (recipient_id = (select auth.uid()) and status = 'pending')
    or (sender_id = (select auth.uid()) and status = 'pending')
  );
```

**Performance Note:** All policies use `(select auth.uid())` wrapper for function call caching - Per security-rls-performance.md. Helper functions use `security definer` with explicit `search_path` for safety.

---

## Queries

### Query: Feed Pagination (Cursor-based)

**Purpose:** Load community posts with infinite scroll using cursor-based pagination.

**Best Practice Reference:** `@~/.claude/skills/supabase-postgres-best-practices/references/data-pagination.md`

```sql
-- Initial load (no cursor)
select
  p.id,
  p.content,
  p.media_urls,
  p.like_count,
  p.comment_count,
  p.created_at,
  p.author_id,
  pr.full_name as author_name,
  pr.avatar_url as author_avatar,
  pr.company_name as author_company,
  exists(
    select 1 from likes l
    where l.likeable_type = 'post'
    and l.likeable_id = p.id
    and l.user_id = auth.uid()
  ) as is_liked
from posts p
join profiles pr on pr.id = p.author_id
where p.is_hidden = false
order by p.created_at desc, p.id desc
limit 20;

-- Next page (with cursor: last post's created_at and id)
select
  p.id,
  p.content,
  p.media_urls,
  p.like_count,
  p.comment_count,
  p.created_at,
  p.author_id,
  pr.full_name as author_name,
  pr.avatar_url as author_avatar,
  pr.company_name as author_company,
  exists(
    select 1 from likes l
    where l.likeable_type = 'post'
    and l.likeable_id = p.id
    and l.user_id = auth.uid()
  ) as is_liked
from posts p
join profiles pr on pr.id = p.author_id
where p.is_hidden = false
  and (p.created_at, p.id) < ($cursor_created_at, $cursor_id)
order by p.created_at desc, p.id desc
limit 20;
```

**Why This Approach:**
- Cursor-based pagination is O(1) regardless of page depth - Per data-pagination.md
- Composite cursor (created_at, id) ensures stable ordering
- Uses `posts_feed_idx` index for efficient filtering and sorting
- JOIN with profiles avoids N+1 queries - Per data-n-plus-one.md

---

### Query: Expert Search with Filters

**Purpose:** Search experts with category, keyword, and price filters.

**Best Practice Reference:** `@~/.claude/skills/supabase-postgres-best-practices/references/query-composite-indexes.md`

```sql
-- Expert search with filters
select
  ep.id,
  ep.business_name,
  ep.category,
  ep.specialty,
  ep.price_range_min,
  ep.price_range_max,
  ep.service_regions,
  ep.is_available,
  ep.is_featured,
  ep.view_count,
  p.full_name as contact_name,
  p.avatar_url,
  p.location
from expert_profiles ep
join profiles p on p.id = ep.user_id
where ep.status = 'approved'
  and ep.is_available = true
  -- Optional filters (use COALESCE for optional params)
  and (nullif($category, '') is null or ep.category = $category::expert_category)
  and (nullif($keyword, '') is null or
       to_tsvector('simple', ep.business_name || ' ' || coalesce(ep.service_description, ''))
       @@ plainto_tsquery('simple', $keyword))
  and ($min_price is null or ep.price_range_max >= $min_price or ep.price_range_max is null)
  and ($max_price is null or ep.price_range_min <= $max_price or ep.price_range_min is null)
  and (cardinality($regions::text[]) = 0 or ep.service_regions && $regions)
order by
  ep.is_featured desc,
  ep.created_at desc
limit $limit offset $offset; -- OFFSET OK for expert search (limited result sets)
```

**Why This Approach:**
- Uses partial index `expert_profiles_search_idx` for approved experts
- Full-text search via GIN index
- Array overlap (`&&`) for region filtering uses GIN index
- OFFSET acceptable here due to limited total experts (not millions of rows)

---

### Query: Admin Pending Approvals

**Purpose:** List pending member or expert approvals for admin dashboard.

```sql
-- Pending member approvals
select
  p.id,
  p.full_name,
  p.email,
  p.company_name,
  p.job_title,
  p.created_at
from profiles p
where p.approval_status = 'pending'
order by p.created_at asc
limit 50;

-- Pending expert approvals
select
  ep.id,
  ep.business_name,
  ep.category,
  ep.status,
  ep.submitted_at,
  p.full_name,
  p.email
from expert_profiles ep
join profiles p on p.id = ep.user_id
where ep.status = 'pending_review'
order by ep.submitted_at asc
limit 50;
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/v1/signup` | Email/password registration |
| POST | `/auth/v1/token?grant_type=password` | Email/password login |
| GET | `/auth/v1/authorize` | OAuth (Google) initiation |
| POST | `/auth/v1/otp` | Send OTP for verification |
| POST | `/auth/v1/verify` | Verify OTP |
| POST | `/auth/v1/logout` | Sign out |

### Profiles

**Endpoint:** `/rest/v1/profiles`

```typescript
// Get current user's profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

// Update profile
const { error } = await supabase
  .from('profiles')
  .update({
    full_name: 'New Name',
    company_name: 'Company',
    bio: 'Bio text',
    expertise: ['AI/ML', 'SaaS'],
    skills: ['Product Management']
  })
  .eq('id', user.id);

// Admin: Update approval status
const { error } = await supabase
  .from('profiles')
  .update({
    approval_status: 'approved'
  })
  .eq('id', targetUserId);
```

### Expert Profiles

**Endpoint:** `/rest/v1/expert_profiles`

```typescript
// Search experts
interface ExpertSearchParams {
  category?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  regions?: string[];
  limit?: number;
  offset?: number;
}

const { data: experts } = await supabase
  .from('expert_profiles')
  .select(`
    id,
    business_name,
    category,
    specialty,
    price_range_min,
    price_range_max,
    service_regions,
    is_available,
    is_featured,
    profiles!inner(full_name, avatar_url, location)
  `)
  .eq('status', 'approved')
  .eq('is_available', true)
  .eq('category', params.category) // if provided
  .textSearch('business_name', params.keyword) // if provided
  .order('is_featured', { ascending: false })
  .order('created_at', { ascending: false })
  .range(params.offset, params.offset + params.limit - 1);

// Get single expert profile
const { data: expert } = await supabase
  .from('expert_profiles')
  .select(`
    *,
    profiles(full_name, avatar_url, location, bio, expertise)
  `)
  .eq('id', expertId)
  .single();

// Register as expert
const { data, error } = await supabase
  .from('expert_profiles')
  .insert({
    user_id: user.id,
    business_name: 'Company Name',
    category: 'marketing',
    service_description: 'Description...',
    status: 'pending_review'
  })
  .select()
  .single();
```

### Posts (Community Feed)

**Endpoint:** `/rest/v1/posts`

```typescript
// Feed with cursor pagination
interface FeedCursor {
  created_at: string;
  id: number;
}

const fetchFeed = async (cursor?: FeedCursor) => {
  let query = supabase
    .from('posts')
    .select(`
      id,
      content,
      media_urls,
      like_count,
      comment_count,
      created_at,
      profiles!author_id(id, full_name, avatar_url, company_name)
    `)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(20);

  if (cursor) {
    query = query.or(`created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`);
  }

  return query;
};

// Create post
const { data, error } = await supabase
  .from('posts')
  .insert({
    author_id: user.id,
    content: 'Post content...',
    media_urls: ['path/to/image.jpg']
  })
  .select()
  .single();

// Delete post
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId)
  .eq('author_id', user.id);
```

### Real-time Subscriptions

```typescript
// Subscribe to new posts
const channel = supabase
  .channel('public:posts')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'posts'
    },
    (payload) => {
      console.log('New post:', payload.new);
    }
  )
  .subscribe();

// Subscribe to notifications
const notificationsChannel = supabase
  .channel('user-notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${user.id}`
    },
    (payload) => {
      console.log('New notification:', payload.new);
    }
  )
  .subscribe();
```

---

## File Storage Strategy

### Storage Buckets

```sql
-- Create storage buckets via Supabase Dashboard or SQL
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('post-media', 'post-media', true),
  ('expert-documents', 'expert-documents', false),
  ('expert-portfolio', 'expert-portfolio', true),
  ('program-images', 'program-images', true);
```

### Storage RLS Policies

```sql
-- Avatars bucket policies
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Post media bucket policies
create policy "Post media is publicly accessible"
  on storage.objects for select
  using (bucket_id = 'post-media');

create policy "Approved members can upload post media"
  on storage.objects for insert
  with check (
    bucket_id = 'post-media'
    and (select is_approved_member())
  );

-- Expert documents (private - only owner and admin)
create policy "Expert documents visible to owner and admin"
  on storage.objects for select
  using (
    bucket_id = 'expert-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (select is_admin())
    )
  );

create policy "Experts can upload documents"
  on storage.objects for insert
  with check (
    bucket_id = 'expert-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

### File Upload Patterns

```typescript
// Upload avatar
const uploadAvatar = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${user.id}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Update profile with new URL
  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);
};

// Upload post media
const uploadPostMedia = async (files: File[]) => {
  const uploadPromises = files.map(async (file) => {
    const fileName = `${user.id}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from('post-media')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('post-media')
      .getPublicUrl(fileName);

    return publicUrl;
  });

  return Promise.all(uploadPromises);
};
```

---

## Edge Functions

### Function: send-notification

**Purpose:** Create notifications and optionally send push/email.

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface NotificationPayload {
  user_id: string;
  type: string;
  title: string;
  body?: string;
  reference_type?: string;
  reference_id?: string;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const payload: NotificationPayload = await req.json();

  // Insert notification
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: payload.user_id,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      reference_type: payload.reference_type,
      reference_id: payload.reference_id,
      metadata: payload.metadata ?? {}
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // TODO: Add push notification / email integration here

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});
```

### Function: approve-member

**Purpose:** Admin function to approve/reject member registration.

```typescript
// supabase/functions/approve-member/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ApprovalPayload {
  user_id: string;
  approved: boolean;
  rejection_reason?: string;
}

serve(async (req) => {
  const authHeader = req.headers.get('Authorization');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader ?? '' } } }
  );

  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  // Process approval
  const payload: ApprovalPayload = await req.json();

  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { error: updateError } = await serviceClient
    .from('profiles')
    .update({
      approval_status: payload.approved ? 'approved' : 'rejected',
      rejection_reason: payload.rejection_reason
    })
    .eq('id', payload.user_id);

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 400 });
  }

  // Send notification to user
  await serviceClient.functions.invoke('send-notification', {
    body: {
      user_id: payload.user_id,
      type: payload.approved ? 'member_approved' : 'member_rejected',
      title: payload.approved
        ? 'Welcome to The Potential!'
        : 'Registration Update',
      body: payload.approved
        ? 'Your membership has been approved. Start exploring!'
        : `Your registration was not approved. Reason: ${payload.rejection_reason}`
    }
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});
```

---

## Data Access Patterns

### Pattern: Optimized Feed Loading

**Problem:** Loading feed with author info and like status requires multiple queries.

**Solution:** Single query with JOINs and correlated subquery for like status.

**Best Practice Reference:** `@~/.claude/skills/supabase-postgres-best-practices/references/data-n-plus-one.md`

```typescript
// Using Supabase client with nested selects
const { data: posts } = await supabase
  .from('posts')
  .select(`
    id,
    content,
    media_urls,
    like_count,
    comment_count,
    created_at,
    author:profiles!author_id(
      id,
      full_name,
      avatar_url,
      company_name
    )
  `)
  .eq('is_hidden', false)
  .order('created_at', { ascending: false })
  .limit(20);

// Check like status in batch (single query for all posts)
const postIds = posts?.map(p => p.id) ?? [];
const { data: userLikes } = await supabase
  .from('likes')
  .select('likeable_id')
  .eq('likeable_type', 'post')
  .eq('user_id', user.id)
  .in('likeable_id', postIds);

const likedPostIds = new Set(userLikes?.map(l => l.likeable_id));
const postsWithLikeStatus = posts?.map(p => ({
  ...p,
  is_liked: likedPostIds.has(p.id)
}));
```

### Pattern: Real-time Notification Badge

**Problem:** Show unread notification count in real-time.

**Solution:** Use Supabase Realtime with count subscription.

```typescript
// Initial count
const { count } = await supabase
  .from('notifications')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .eq('is_read', false);

// Real-time updates
const channel = supabase
  .channel('notification-count')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${user.id}`
    },
    async () => {
      // Re-fetch count on any change
      const { count: newCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      setUnreadCount(newCount ?? 0);
    }
  )
  .subscribe();
```

---

## Connection Management

**Best Practice Reference:** `@~/.claude/skills/supabase-postgres-best-practices/references/conn-pooling.md`

### Supabase Connection Configuration

| Setting | Recommendation | Notes |
|---------|---------------|-------|
| Connection URL | Use Pooler URL | `db.xxx.supabase.co:6543` (pooler) not `:5432` |
| Pool Mode | Transaction | Best for serverless/edge functions |
| Max Connections | Default (varies by plan) | Free: 15, Pro: 60, Team: 200 |

### Client Configuration

```typescript
// Use pooler connection string for all client connections
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// For server-side with service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

### Edge Function Best Practices

```typescript
// Reuse client instance (connection pooling)
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create once, reuse for multiple requests
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Use shared client - connections are pooled
  const { data } = await supabase.from('profiles').select('*').limit(10);
  return new Response(JSON.stringify(data));
});
```

---

## Migration Plan

### Migration 1: Initial Schema Setup

```sql
-- Up
-- Run all CREATE TYPE, CREATE TABLE, CREATE INDEX statements from schema section above

-- Down
drop table if exists collaboration_requests cascade;
drop table if exists notifications cascade;
drop table if exists bookmarks cascade;
drop table if exists likes cascade;
drop table if exists comments cascade;
drop table if exists posts cascade;
drop table if exists support_programs cascade;
drop table if exists expert_profiles cascade;
drop table if exists profiles cascade;

drop type if exists collaboration_status;
drop type if exists collaboration_type;
drop type if exists notification_type;
drop type if exists bookmarkable_type;
drop type if exists likeable_type;
drop type if exists program_status;
drop type if exists program_category;
drop type if exists expert_status;
drop type if exists expert_category;
drop type if exists approval_status;
drop type if exists user_role;
```

### Migration 2: Enable RLS and Create Policies

```sql
-- Up
-- Run all ALTER TABLE ENABLE ROW LEVEL SECURITY and CREATE POLICY statements

-- Down
-- Drop all policies and disable RLS
```

### Migration 3: Create Triggers

```sql
-- Up
-- Run all CREATE FUNCTION and CREATE TRIGGER statements

-- Down
-- Drop triggers and functions
```

### Migration 4: Storage Setup

```sql
-- Up
-- Create storage buckets and policies

-- Down
-- Remove storage buckets and policies
```

---

## Checklist

Before implementation, verify:

- [x] All tables use appropriate primary keys (UUID for auth-linked, BIGINT IDENTITY for high-volume)
- [x] Foreign keys have explicit indexes created
- [x] RLS is enabled on ALL tables with user data
- [x] RLS policies use `(select auth.uid())` for performance
- [x] Queries use indexes (composite indexes for multi-column filters)
- [x] N+1 queries avoided with JOINs and batch loading
- [x] Pagination uses cursor-based approach for feed (infinite scroll)
- [x] Connection pooling configured (use Supabase pooler URL)
- [x] All timestamps use TIMESTAMPTZ
- [x] JSONB columns have GIN indexes where queried
- [x] Text search uses GIN indexes with pg_trgm
- [x] Partial indexes used for common filtered queries
- [x] Helper functions use SECURITY DEFINER with explicit search_path
- [x] Storage buckets have appropriate RLS policies

---

## References Used

- `@~/.claude/skills/supabase-postgres-best-practices/references/schema-primary-keys.md` - PK strategy selection
- `@~/.claude/skills/supabase-postgres-best-practices/references/schema-data-types.md` - Data type selection
- `@~/.claude/skills/supabase-postgres-best-practices/references/schema-foreign-key-indexes.md` - FK index requirement
- `@~/.claude/skills/supabase-postgres-best-practices/references/security-rls-basics.md` - RLS fundamentals
- `@~/.claude/skills/supabase-postgres-best-practices/references/security-rls-performance.md` - RLS optimization
- `@~/.claude/skills/supabase-postgres-best-practices/references/query-missing-indexes.md` - Index creation
- `@~/.claude/skills/supabase-postgres-best-practices/references/query-composite-indexes.md` - Composite index design
- `@~/.claude/skills/supabase-postgres-best-practices/references/data-pagination.md` - Cursor pagination
- `@~/.claude/skills/supabase-postgres-best-practices/references/data-n-plus-one.md` - Batch query patterns
- `@~/.claude/skills/supabase-postgres-best-practices/references/conn-pooling.md` - Connection management
- `@~/.claude/skills/supabase-postgres-best-practices/references/advanced-jsonb-indexing.md` - JSONB optimization

---

*This Backend Plan serves as the comprehensive technical specification for The Potential platform's Supabase backend. All design decisions follow Supabase Postgres best practices as documented in the referenced guidelines.*
