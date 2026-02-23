-- ===========================================================================
-- Supabase Auto-Delete: Remove data older than 7 days
-- ===========================================================================
-- Run this SQL once in the Supabase SQL Editor (Dashboard → SQL Editor → New Query).
--
-- It creates a cleanup function and schedules it to run daily via pg_cron.
-- NOTE: pg_cron requires Supabase Pro plan or above. On the free tier, use
--       the /api/cron/cleanup endpoint with an external scheduler instead.
-- ===========================================================================

-- 1. Create the cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete old donation click analytics first (no foreign key dependencies)
  DELETE FROM donation_clicks
  WHERE created_at < NOW() - INTERVAL '7 days';

  -- Delete old replies (references cards.id)
  DELETE FROM replies
  WHERE created_at < NOW() - INTERVAL '7 days';

  -- Delete old payments (references cards.id)
  DELETE FROM payments
  WHERE created_at < NOW() - INTERVAL '7 days';

  -- Delete old cards last (parent table)
  DELETE FROM cards
  WHERE created_at < NOW() - INTERVAL '7 days';

  RAISE NOTICE 'cleanup_expired_data: completed at %', NOW();
END;
$$;

-- 2. Enable pg_cron extension (requires Supabase Pro plan)
--    If you are on the free tier, skip this and use the API endpoint instead.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 3. Schedule the cleanup to run daily at 3:00 AM UTC
SELECT cron.schedule(
  'cleanup-expired-data',    -- job name
  '0 3 * * *',               -- cron expression: daily at 03:00 UTC
  'SELECT cleanup_expired_data();'
);

-- ===========================================================================
-- To verify the job was created:
--   SELECT * FROM cron.job;
--
-- To remove the scheduled job later:
--   SELECT cron.unschedule('cleanup-expired-data');
--
-- To run the cleanup manually:
--   SELECT cleanup_expired_data();
-- ===========================================================================
