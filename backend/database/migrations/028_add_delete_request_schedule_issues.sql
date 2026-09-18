-- Migration 028: track schedule issues in admin delete requests.
-- Safe: existing delete requests keep NULL until next approval.

BEGIN;

ALTER TABLE public.delete_requests
    ADD COLUMN IF NOT EXISTS schedule_issues_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.delete_requests
    ADD COLUMN IF NOT EXISTS deleted_schedule_issues integer;

COMMIT;