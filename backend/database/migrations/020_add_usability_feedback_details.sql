-- Migration 020: add system usability details to feedback.
-- Safe: additive only.

BEGIN;

ALTER TABLE public.feedback
    ADD COLUMN IF NOT EXISTS ease_of_use integer
        CHECK (ease_of_use IS NULL OR (ease_of_use >= 1 AND ease_of_use <= 5)),
    ADD COLUMN IF NOT EXISTS area character varying(50),
    ADD COLUMN IF NOT EXISTS improvement text;

COMMIT;