-- Migration 029: allow schedule issues deletion requests.
-- Municipal admins can request deletion of schedule issues on the
-- Schedule Issues page; system admin approval is required (same flow as
-- notifications/reports delete requests).

BEGIN;

ALTER TABLE public.delete_requests
    DROP CONSTRAINT IF EXISTS delete_requests_request_type_check;

ALTER TABLE public.delete_requests
    ADD CONSTRAINT delete_requests_request_type_check CHECK (
        request_type IN ('notifications', 'reports', 'all', 'schedule_issues')
    );

COMMIT;