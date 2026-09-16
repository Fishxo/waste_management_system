-- Migration 016: collector lifecycle status (active / inactive / resigned)
-- Adds an explicit status alongside is_active so admins can resign collectors.
-- Safe: additive only.

BEGIN;

ALTER TABLE public.collectors
    ADD COLUMN IF NOT EXISTS status character varying(20) NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS resigned_at timestamp without time zone,
    ADD COLUMN IF NOT EXISTS resignation_reason text;

-- Backfill status from the legacy is_active flag
UPDATE public.collectors
SET status = 'inactive'
WHERE is_active = false
  AND status = 'active';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'collectors_status_check'
    ) THEN
        ALTER TABLE public.collectors
            ADD CONSTRAINT collectors_status_check
            CHECK (status IN ('active', 'inactive', 'resigned'));
    END IF;
END $$;

COMMIT;
