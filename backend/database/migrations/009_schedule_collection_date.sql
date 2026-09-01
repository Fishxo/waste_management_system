-- Migration 009: align schedules with docs (collection_date, status)
-- Renames collection_day -> collection_date and collection_status -> status.

BEGIN;

ALTER TABLE public.schedules
    ADD COLUMN IF NOT EXISTS collection_date date;

UPDATE public.schedules
SET collection_date = CURRENT_DATE
WHERE collection_date IS NULL;

ALTER TABLE public.schedules
    DROP COLUMN IF EXISTS collection_day;

ALTER TABLE public.schedules
    ALTER COLUMN collection_date SET NOT NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'schedules'
          AND column_name = 'collection_status'
    ) THEN
        ALTER TABLE public.schedules
            RENAME COLUMN collection_status TO status;
    END IF;
END $$;

COMMIT;
