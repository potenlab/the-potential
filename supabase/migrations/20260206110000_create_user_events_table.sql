-- ============================================================================
-- Migration: Create user_events table for user-generated events/ads
-- Created: 2026-02-06
-- Description: Allows authenticated users to post events, ads, and announcements
-- ============================================================================

-- Create event_type enum
CREATE TYPE public.event_type AS ENUM ('event', 'ad', 'announcement');

-- Create user_events table
CREATE TABLE IF NOT EXISTS public.user_events (
  id SERIAL PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type public.event_type NOT NULL DEFAULT 'event',
  category public.program_category,
  image_url TEXT,
  external_url TEXT,
  event_date TIMESTAMPTZ,
  location VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_user_events_author_id ON public.user_events(author_id);
CREATE INDEX idx_user_events_event_type ON public.user_events(event_type);
CREATE INDEX idx_user_events_category ON public.user_events(category);
CREATE INDEX idx_user_events_is_active ON public.user_events(is_active);
CREATE INDEX idx_user_events_created_at ON public.user_events(created_at DESC);
CREATE INDEX idx_user_events_event_date ON public.user_events(event_date);

-- Add comment for documentation
COMMENT ON TABLE public.user_events IS 'User-generated events, ads, and announcements';
COMMENT ON COLUMN public.user_events.event_type IS 'Type of event: event, ad, or announcement';
COMMENT ON COLUMN public.user_events.category IS 'Optional category (same as support program categories)';
COMMENT ON COLUMN public.user_events.event_date IS 'Date/time when the event takes place (for events)';
COMMENT ON COLUMN public.user_events.location IS 'Location where the event takes place';

-- Enable Row Level Security
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Allow anyone to read active events
CREATE POLICY "Anyone can view active events"
  ON public.user_events
  FOR SELECT
  USING (is_active = true);

-- Allow authenticated users to create events
CREATE POLICY "Authenticated users can create events"
  ON public.user_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Allow users to update their own events
CREATE POLICY "Users can update own events"
  ON public.user_events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Allow users to delete their own events
CREATE POLICY "Users can delete own events"
  ON public.user_events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_user_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_events_updated_at
  BEFORE UPDATE ON public.user_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_events_updated_at();

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_event_view_count(event_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_events
  SET view_count = view_count + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
