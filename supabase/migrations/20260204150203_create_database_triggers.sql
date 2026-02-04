-- Migration: Create Database Triggers
-- Task 2.8: Create triggers for timestamps, like counts, comment counts, profile creation

-- ============================================
-- 1. Auto-update timestamps function
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers to all tables with updated_at column
-- (These may already exist from previous migrations, use CREATE OR REPLACE for idempotency)

-- Drop existing triggers if they exist to avoid conflicts
drop trigger if exists profiles_updated_at on profiles;
drop trigger if exists expert_profiles_updated_at on expert_profiles;
drop trigger if exists posts_updated_at on posts;
drop trigger if exists comments_updated_at on comments;
drop trigger if exists support_programs_updated_at on support_programs;
drop trigger if exists collaboration_requests_updated_at on collaboration_requests;

-- Create updated_at triggers
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

-- ============================================
-- 2. Like count management
-- ============================================

-- Function to update like counts on posts and comments
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

-- Drop existing trigger if exists
drop trigger if exists likes_count_trigger on likes;

-- Create the like count trigger
create trigger likes_count_trigger
  after insert or delete on likes
  for each row execute function update_like_count();

-- ============================================
-- 3. Comment count management
-- ============================================

-- Function to update comment counts on posts
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

-- Drop existing trigger if exists
drop trigger if exists comments_count_trigger on comments;

-- Create the comment count trigger
create trigger comments_count_trigger
  after insert or delete on comments
  for each row execute function update_comment_count();

-- ============================================
-- 4. Profile creation on user signup
-- ============================================

-- Function to create profile when a new user signs up via Supabase Auth
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

-- Drop existing trigger if exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger on auth.users table
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- Comments for documentation
-- ============================================
comment on function update_updated_at() is 'Automatically updates updated_at timestamp when a row is modified';
comment on function update_like_count() is 'Maintains denormalized like counts on posts and comments';
comment on function update_comment_count() is 'Maintains denormalized comment count on posts';
comment on function handle_new_user() is 'Creates a profile record when a new user signs up via Supabase Auth';
