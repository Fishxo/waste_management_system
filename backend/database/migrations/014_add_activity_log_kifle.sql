-- Migration 014: record which sub-city (kifle ketema) a municipal admin belongs to.
-- Safe: additive only. No DROP. No DELETE.

BEGIN;

ALTER TABLE public.activity_logs
    ADD COLUMN IF NOT EXISTS actor_kifle_ketema varchar(100);

-- backfill for existing municipal admin activity
UPDATE activity_logs a
SET actor_kifle_ketema = m.kifle_ketema
FROM municipal_admins m
WHERE a.actor_role = 'municipal_admin'
  AND a.actor_id = m.id
  AND a.actor_kifle_ketema IS NULL;

CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_kifle
    ON public.activity_logs (actor_kifle_ketema);

COMMIT;