-- Migration 022: allow business owners to raise schedule issues.
-- Safe: existing resident schedule issues remain unchanged.

BEGIN;

ALTER TABLE public.schedule_issues
    ADD COLUMN IF NOT EXISTS business_id integer
        REFERENCES public.business_owners(business_id) ON DELETE CASCADE;

ALTER TABLE public.schedule_issues
    ALTER COLUMN resident_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_schedule_issues_business_id
    ON public.schedule_issues(business_id);

COMMIT;