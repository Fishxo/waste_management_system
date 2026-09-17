-- Migration 024: group bulk notification deliveries as one admin event.
-- Safe: existing notification deliveries remain individual records.

BEGIN;

ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS broadcast_id uuid;

CREATE INDEX IF NOT EXISTS idx_notifications_broadcast_id
    ON public.notifications(broadcast_id);

COMMIT;