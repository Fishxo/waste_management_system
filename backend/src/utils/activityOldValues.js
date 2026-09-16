const pool = require("../database/db");

// Pre-update lookups used by the activity logger to describe state changes
// (e.g. "pending -> resolved") and reassignments.

async function reportOld(req) {
    const result = await pool.query(
        `SELECT status FROM reports WHERE id = $1`,
        [req.params.id]
    );
    return result.rows[0] ? { previousStatus: result.rows[0].status } : null;
}

async function scheduleIssueOld(req) {
    const result = await pool.query(
        `SELECT status FROM schedule_issues WHERE id = $1`,
        [req.params.id]
    );
    return result.rows[0] ? { previousStatus: result.rows[0].status } : null;
}

async function onDemandStatusOld(req) {
    const result = await pool.query(
        `SELECT status FROM on_demand_requests WHERE id = $1`,
        [req.params.id]
    );
    return result.rows[0] ? { previousStatus: result.rows[0].status } : null;
}

async function onDemandCollectionOld(req) {
    const result = await pool.query(
        `SELECT collection_status FROM on_demand_requests WHERE id = $1`,
        [req.params.id]
    );
    return result.rows[0]
        ? { previousStatus: result.rows[0].collection_status }
        : null;
}

async function scheduleCollectionOld(req) {
    const result = await pool.query(
        `SELECT status FROM schedules WHERE id = $1`,
        [req.params.id]
    );
    return result.rows[0] ? { previousStatus: result.rows[0].status } : null;
}

async function scheduleAssignOld(req) {
    const result = await pool.query(
        `SELECT collector_id FROM schedules WHERE id = $1`,
        [req.params.id]
    );
    return result.rows[0]
        ? { previousCollectorId: result.rows[0].collector_id }
        : null;
}

async function requestAssignOld(req) {
    const result = await pool.query(
        `SELECT collector_id FROM on_demand_requests WHERE id = $1`,
        [req.params.id]
    );
    return result.rows[0]
        ? { previousCollectorId: result.rows[0].collector_id }
        : null;
}

async function collectorActiveOld(req) {
    const result = await pool.query(
        `SELECT status, is_active FROM collectors WHERE id = $1`,
        [req.params.id]
    );

    if (!result.rows[0]) return null;

    const { status, is_active } = result.rows[0];

    return {
        previousStatus: status || (is_active ? "active" : "inactive"),
    };
}

async function collectorEditOld(req) {
    const result = await pool.query(
        `SELECT full_name, phone_number, email, kifle_ketema, status
         FROM collectors WHERE id = $1`,
        [req.params.id]
    );

    if (!result.rows[0]) return null;

    const { full_name, phone_number, email, kifle_ketema, status } =
        result.rows[0];

    return {
        previousFullName: full_name,
        previousPhoneNumber: phone_number,
        previousEmail: email,
        previousKifleKetema: kifle_ketema,
        previousStatus: status,
    };
}

async function municipalAdminActiveOld(req) {
    const result = await pool.query(
        `SELECT status, is_active FROM municipal_admins WHERE id = $1`,
        [req.params.id]
    );

    if (!result.rows[0]) return null;

    const { status, is_active } = result.rows[0];

    return {
        previousStatus: status || (is_active ? "active" : "inactive"),
    };
}

async function municipalAdminEditOld(req) {
    const result = await pool.query(
        `SELECT username, email, kifle_ketema, status
         FROM municipal_admins WHERE id = $1`,
        [req.params.id]
    );

    if (!result.rows[0]) return null;

    const { username, email, kifle_ketema, status } = result.rows[0];

    return {
        previousUsername: username,
        previousEmail: email,
        previousKifleKetema: kifle_ketema,
        previousStatus: status,
    };
}

async function residentActiveOld(req) {
    const result = await pool.query(
        `SELECT is_active FROM residents WHERE id = $1`,
        [req.params.id]
    );
    return result.rows[0]
        ? { previousStatus: result.rows[0].is_active ? "active" : "inactive" }
        : null;
}

async function businessActiveOld(req) {
    const result = await pool.query(
        `SELECT is_active FROM business_owners WHERE business_id = $1`,
        [req.params.id]
    );
    return result.rows[0]
        ? { previousStatus: result.rows[0].is_active ? "active" : "inactive" }
        : null;
}

module.exports = {
    reportOld,
    scheduleIssueOld,
    onDemandStatusOld,
    onDemandCollectionOld,
    scheduleCollectionOld,
    scheduleAssignOld,
    requestAssignOld,
    collectorActiveOld,
    collectorEditOld,
    municipalAdminActiveOld,
    municipalAdminEditOld,
    residentActiveOld,
    businessActiveOld,
};
