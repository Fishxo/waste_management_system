-- Migration 008: admin kifle ketema scoping + business owner is_active
-- Safe: additive only.

BEGIN;

ALTER TABLE public.municipal_admins
    ADD COLUMN IF NOT EXISTS kifle_ketema character varying(100);

ALTER TABLE public.business_owners
    ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

COMMIT;
