-- Migration 025: optionally target one notification type in delete requests.
-- Safe: existing requests with NULL type continue to mean all notification types.

BEGIN;

ALTER TABLE public.delete_requests
    ADD COLUMN IF NOT EXISTS notification_type character varying(50);

COMMIT;