-- Migration 027: soft-delete on-demand requests from the business owner's own view.
-- When a business owner deletes a request, it is only hidden from their list;
-- the record remains visible to municipal admins and collectors.

BEGIN;

ALTER TABLE public.on_demand_requests
    ADD COLUMN IF NOT EXISTS deleted_by_business_at timestamp without time zone;

CREATE INDEX IF NOT EXISTS idx_on_demand_requests_deleted_by_business
    ON public.on_demand_requests(deleted_by_business_at);

COMMIT;