-- Migration 023: store business owner sefer.
-- Safe: additive only.

BEGIN;

ALTER TABLE public.business_owners
    ADD COLUMN IF NOT EXISTS sefer character varying(100);

COMMIT;