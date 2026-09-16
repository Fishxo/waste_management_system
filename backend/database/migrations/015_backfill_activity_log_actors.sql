-- Migration 015: keep recorded actor names/sub-cities in sync with the current
-- admin identity, so a renamed admin keeps all their history under one name.
-- Safe: idempotent UPDATE, no drops, no deletes.

BEGIN;

UPDATE activity_logs a
SET actor_name = m.username,
    actor_kifle_ketema = m.kifle_ketema
FROM municipal_admins m
WHERE a.actor_role = 'municipal_admin'
  AND a.actor_id = m.id
  AND (a.actor_name IS DISTINCT FROM m.username
       OR a.actor_kifle_ketema IS DISTINCT FROM m.kifle_ketema);

COMMIT;