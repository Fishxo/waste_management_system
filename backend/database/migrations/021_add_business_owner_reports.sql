-- Migration 021: allow business owners to submit and manage reports.
-- Safe: existing resident and collector reports remain unchanged.

BEGIN;

ALTER TABLE public.reports
    ADD COLUMN IF NOT EXISTS business_id integer
        REFERENCES public.business_owners(business_id) ON DELETE CASCADE;

ALTER TABLE public.reports
    DROP CONSTRAINT IF EXISTS chk_reports_reporter;

ALTER TABLE public.reports
    ADD CONSTRAINT chk_reports_reporter CHECK (
        (reporter_role = 'resident' AND resident_id IS NOT NULL AND collector_id IS NULL AND business_id IS NULL)
        OR
        (reporter_role = 'collector' AND collector_id IS NOT NULL AND resident_id IS NULL AND business_id IS NULL)
        OR
        (reporter_role = 'business_owner' AND business_id IS NOT NULL AND resident_id IS NULL AND collector_id IS NULL)
    );

CREATE INDEX IF NOT EXISTS idx_reports_business_id ON public.reports(business_id);

COMMIT;