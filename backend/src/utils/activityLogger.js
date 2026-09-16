const activityLogService = require("../modules/activityLogs/activityLog.service");

function getBodyId(req, body) {
    const id = body?.data?.id ?? body?.data?.business_id;
    return id ? Number(id) : null;
}

function defaultEntityId(req, body) {
    if (req.params && req.params.id) {
        return Number(req.params.id);
    }
    return getBodyId(req, body);
}

// descriptive fields worth capturing for activity detail
const DETAIL_FIELDS = [
    "id",
    "title",
    "description",
    "status",
    "resigned_at",
    "resignation_reason",
    "created_at",
    "updated_at",
    "username",
    "email",
    "phone_number",
    "full_name",
    "first_name",
    "last_name",
    "resident_code",
    "kifle_ketema",
    "kebele",
    "sefer",
    "address",
    "business_name",
    "company_name",
    "message",
    "subject",
    "count",
    "recipient_count",
    "schedule_date",
    "collection_status",
    "collector_id",
    "report_type",
    "date_range",
    "backup_file",
];

// extract a compact, human-readable summary from the response payload
function summarize(body) {
    const data = body?.data;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return null;
    }

    const out = {};
    for (const field of DETAIL_FIELDS) {
        if (data[field] !== undefined && data[field] !== null) {
            out[field] = data[field];
        }
    }

    return Object.keys(out).length ? out : null;
}

module.exports = function makeActivityLogger({
    action,
    entityType,
    getEntityId = defaultEntityId,
    getDetails = null,
    fetchOldValues = null,
    resolveActor = null,
}) {
    return (req, res, next) => {
        // capture the pre-update state before the controller mutates it
        const oldValuesPromise = fetchOldValues
            ? Promise.resolve()
                  .then(() => fetchOldValues(req))
                  .catch(() => null)
            : null;

        const originalJson = res.json.bind(res);
        let responseBody = null;

        res.json = (body) => {
            responseBody = body;
            return originalJson(body);
        };

        res.on("finish", async () => {
            if (res.statusCode < 200 || res.statusCode >= 300) return;

            let actorRole = req.user ? req.user.role : null;
            let actorId = req.user ? req.user.id : null;

            // allow unauthenticated actions (login) to resolve their actor
            if (resolveActor) {
                try {
                    const resolved = resolveActor(req, responseBody) || {};
                    if (resolved.actorRole) actorRole = resolved.actorRole;
                    if (resolved.actorId) actorId = resolved.actorId;
                } catch {
                    // ignore actor resolution errors
                }
            }

            if (!actorRole || !actorId) return;

            let entityId = null;
            let details = null;
            try {
                entityId = getEntityId(req, responseBody) || null;
                const summary = summarize(responseBody) || {};

                let oldValues = null;
                if (oldValuesPromise) {
                    oldValues = await oldValuesPromise;
                }

                const extra = getDetails
                    ? getDetails(req, responseBody, oldValues) || {}
                    : {};

                const merged = { ...(oldValues || {}), ...summary, ...extra };

                // describe status transitions as "from -> to"
                if (merged.previousStatus && !merged.statusChange) {
                    const next =
                        merged.newStatus ||
                        merged.status ||
                        merged.collection_status;
                    if (next) {
                        merged.statusChange = `${merged.previousStatus} -> ${next}`;
                    }
                }

                details = Object.keys(merged).length ? merged : null;
            } catch {
                // ignore detail resolution errors, still log the activity
            }

            activityLogService
                .logActivity({
                    actorRole,
                    actorId,
                    action,
                    entityType,
                    entityId,
                    details,
                })
                .catch(() => {});
        });

        next();
    };
};