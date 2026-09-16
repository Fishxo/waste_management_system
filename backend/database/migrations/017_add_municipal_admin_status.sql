-- Migration 017: municipal admin lifecycle status (active / inactive / resigned)
-- Mirrors the collector status model so system admins can resign municipal
-- admins who leave. Safe: additive only.

BEGIN;

ALTER TABLE public.municipal_admins
    ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS status character varying(20) NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS resigned_at timestamp without time zone,
    ADD COLUMN IF NOT EXISTS resignation_reason text;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'municipal_admins_status_check'
    ) THEN
        ALTER TABLE public.municipal_admins
            ADD CONSTRAINT municipal_admins_status_check
            CHECK (status IN ('active', 'inactive', 'resigned'));
    END IF;
END $$;

COMMIT;