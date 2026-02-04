-- Enable PostgreSQL extensions for text search functionality
-- pg_trgm: Provides trigram-based similarity search (fuzzy matching)
-- unaccent: Removes accents from characters for better search matching

-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA public;

-- Enable unaccent extension for accent-insensitive search
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA public;

-- Verify extensions are enabled (these will fail if extensions are not installed)
DO $$
BEGIN
  -- Test pg_trgm
  PERFORM similarity('test', 'test');
  RAISE NOTICE 'pg_trgm extension enabled successfully';

  -- Test unaccent
  PERFORM unaccent('test');
  RAISE NOTICE 'unaccent extension enabled successfully';
END
$$;
