-- Migration: Create collaboration_requests table
-- Purpose: Collaboration proposals and coffee chat requests between members and experts

-- Create collaboration type enum (if not exists)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'collaboration_type') then
    create type collaboration_type as enum ('coffee_chat', 'collaboration');
  end if;
end$$;

-- Create collaboration status enum (if not exists)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'collaboration_status') then
    create type collaboration_status as enum ('pending', 'accepted', 'declined', 'cancelled');
  end if;
end$$;

-- Create collaboration_requests table
create table if not exists collaboration_requests (
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

  -- Constraints: sender and recipient must be different people
  constraint different_parties check (sender_id != recipient_id)
);

-- Indexes for foreign keys (critical for JOIN performance)
create index if not exists collab_requests_sender_idx on collaboration_requests (sender_id);
create index if not exists collab_requests_recipient_idx on collaboration_requests (recipient_id);
create index if not exists collab_requests_expert_idx on collaboration_requests (expert_profile_id);

-- Index for filtering by status
create index if not exists collab_requests_status_idx on collaboration_requests (status);

-- Composite index for inbox queries (recipient's pending requests)
create index if not exists collab_requests_inbox_idx on collaboration_requests (recipient_id, status, created_at desc);

-- Add comment for documentation
comment on table collaboration_requests is 'Collaboration and coffee chat requests between members and experts';
