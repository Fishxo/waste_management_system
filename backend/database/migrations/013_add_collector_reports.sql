-- Allow collectors to submit reports/complaints using the same reports table.
-- Each report is owned by exactly one actor: a resident or a collector.

-- Existing rows are all resident-owned, so dropping NOT NULL is safe.
ALTER TABLE public.reports
    ALTER COLUMN resident_id DROP NOT NULL;

ALTER TABLE public.reports
    ADD COLUMN collector_id integer REFERENCES public.collectors(id) ON DELETE CASCADE;

ALTER TABLE public.reports
    ADD COLUMN reporter_role character varying(20) NOT NULL DEFAULT 'resident';

-- A report must reference exactly the owner matching its reporter_role.
ALTER TABLE public.reports
    ADD CONSTRAINT chk_reports_reporter CHECK (
        (reporter_role = 'resident' AND resident_id IS NOT NULL AND collector_id IS NULL)
        OR
        (reporter_role = 'collector' AND collector_id IS NOT NULL AND resident_id IS NULL)
    );

CREATE INDEX idx_reports_collector_id ON public.reports(collector_id);