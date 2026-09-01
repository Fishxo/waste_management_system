-- Migration 005: business owner confirmation for on-demand collections
-- Safe: additive only.

BEGIN;

ALTER TABLE public.on_demand_requests
    ADD COLUMN IF NOT EXISTS confirmed_at timestamp without time zone;

COMMIT;
