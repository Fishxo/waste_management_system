const pool = require("../../database/db");

exports.countScopedNotifications = async (municipalAdminId, kifleKetema, notificationType = null) => {
    const typeClause = notificationType ? " AND n.type = $3" : "";
    const result = await pool.query(
        `SELECT COUNT(*)::int AS count
         FROM notifications n
         WHERE (
             n.created_by = $1
             OR (n.created_by IS NULL AND (
                 (n.recipient_role = 'resident' AND EXISTS (
                     SELECT 1 FROM residents r
                     WHERE r.id = n.recipient_id AND LOWER(r.kifle_ketema) = LOWER($2)
                 ))
                 OR (n.recipient_role = 'business_owner' AND EXISTS (
                     SELECT 1 FROM business_owners b
                     WHERE b.business_id = n.recipient_id AND LOWER(b.kifle_ketema) = LOWER($2)
                 ))
                 OR (n.recipient_role = 'collector' AND EXISTS (
                     SELECT 1 FROM collectors c
                     WHERE c.id = n.recipient_id AND LOWER(c.kifle_ketema) = LOWER($2)
                 ))
             ))
         )${typeClause}`,
        notificationType
            ? [municipalAdminId, kifleKetema, notificationType]
            : [municipalAdminId, kifleKetema]
    );
    return result.rows[0].count;
};

exports.findPendingRequest = async (municipalAdminId) => {
    const result = await pool.query(
        `SELECT id, request_type, status, kifle_ketema, created_at
         FROM delete_requests
         WHERE municipal_admin_id = $1 AND status = 'pending'
         LIMIT 1`,
        [municipalAdminId]
    );
    return result.rows[0];
};

exports.countScopedReports = async (kifleKetema) => {
    const result = await pool.query(
        `SELECT COUNT(*)::int AS count
         FROM reports r
         WHERE (r.reporter_role = 'resident'
                    AND EXISTS (
                        SELECT 1 FROM residents res
                        WHERE res.id = r.resident_id
                            AND LOWER(res.kifle_ketema) = LOWER($1)
                    ))
               OR (r.reporter_role = 'collector'
                    AND EXISTS (
                        SELECT 1 FROM collectors col
                        WHERE col.id = r.collector_id
                            AND LOWER(col.kifle_ketema) = LOWER($1)
                    ))
               OR (r.reporter_role = 'business_owner'
                    AND EXISTS (
                        SELECT 1 FROM business_owners b
                        WHERE b.business_id = r.business_id
                            AND LOWER(b.kifle_ketema) = LOWER($1)
                    ))`,
        [kifleKetema]
    );
    return result.rows[0].count;
};

exports.countScopedScheduleIssues = async (kifleKetema) => {
    const result = await pool.query(
        `SELECT COUNT(*)::int AS count
         FROM schedule_issues si
         JOIN schedules s ON si.schedule_id = s.id
         WHERE LOWER(s.kifle_ketema) = LOWER($1)`,
        [kifleKetema]
    );
    return result.rows[0].count;
};

exports.createRequest = async ({ municipalAdminId, requestType, notificationType, kifleKetema, reason, notificationsCount, reportsCount, scheduleIssuesCount }) => {
    const query = `
        INSERT INTO delete_requests
        (municipal_admin_id, request_type, notification_type, kifle_ketema, reason, notifications_count, reports_count, schedule_issues_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;
    const result = await pool.query(query, [
        municipalAdminId,
        requestType,
        notificationType || null,
        kifleKetema,
        reason || null,
        notificationsCount,
        reportsCount,
        scheduleIssuesCount,
    ]);
    return result.rows[0];
};

exports.getRequestsByAdmin = async (municipalAdminId) => {
    const result = await pool.query(
        `SELECT id, request_type, notification_type, status, kifle_ketema, reason,
                notifications_count, reports_count, schedule_issues_count,
                deleted_notifications, deleted_reports, deleted_schedule_issues,
                reviewed_by, reviewed_at, created_at
         FROM delete_requests
         WHERE municipal_admin_id = $1
           AND request_type <> 'schedule_issues'
         ORDER BY created_at DESC`,
        [municipalAdminId]
    );
    return result.rows;
};

exports.getScheduleIssueRequestsByAdmin = async (municipalAdminId) => {
    const result = await pool.query(
        `SELECT id, request_type, status, kifle_ketema, reason,
                schedule_issues_count,
                deleted_schedule_issues,
                reviewed_by, reviewed_at, created_at
         FROM delete_requests
         WHERE municipal_admin_id = $1
           AND request_type = 'schedule_issues'
         ORDER BY created_at DESC`,
        [municipalAdminId]
    );
    return result.rows;
};

exports.getAllRequests = async () => {
    const result = await pool.query(
        `SELECT dr.id, dr.request_type, dr.notification_type, dr.status, dr.kifle_ketema, dr.reason,
                dr.notifications_count, dr.reports_count, dr.schedule_issues_count,
                dr.deleted_notifications, dr.deleted_reports, dr.deleted_schedule_issues,
                dr.reviewed_by, dr.reviewed_at, dr.created_at,
                ma.id AS municipal_admin_id,
                ma.username AS municipal_admin_name,
                ma.email AS municipal_admin_email
         FROM delete_requests dr
         LEFT JOIN municipal_admins ma ON dr.municipal_admin_id = ma.id
         ORDER BY
            CASE dr.status WHEN 'pending' THEN 0 ELSE 1 END,
            dr.created_at DESC`
    );
    return result.rows;
};

const deleteScopedReportsSQL = `
    DELETE FROM reports r
    WHERE (r.reporter_role = 'resident'
                AND EXISTS (
                    SELECT 1 FROM residents res
                    WHERE res.id = r.resident_id
                        AND LOWER(res.kifle_ketema) = LOWER($1)
                ))
          OR (r.reporter_role = 'collector'
                AND EXISTS (
                    SELECT 1 FROM collectors col
                    WHERE col.id = r.collector_id
                        AND LOWER(col.kifle_ketema) = LOWER($1)
                ))
          OR (r.reporter_role = 'business_owner'
                AND EXISTS (
                    SELECT 1 FROM business_owners b
                    WHERE b.business_id = r.business_id
                        AND LOWER(b.kifle_ketema) = LOWER($1)
                ))
`;

const deleteScopedScheduleIssuesSQL = `
    DELETE FROM schedule_issues si
    USING schedules s
    WHERE si.schedule_id = s.id
        AND LOWER(s.kifle_ketema) = LOWER($1)
`;

exports.approveRequest = async (requestId, reviewerId) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const requestResult = await client.query(
            `SELECT * FROM delete_requests
             WHERE id = $1 AND status = 'pending'
             FOR UPDATE`,
            [requestId]
        );

        if (!requestResult.rows.length) {
            throw new Error("Request not found or already processed");
        }

        const request = requestResult.rows[0];

        let deletedNotifications = 0;
        let deletedReports = 0;
        let deletedScheduleIssues = 0;

        if (request.request_type === "notifications" || request.request_type === "all") {
            const typeClause = request.notification_type ? " AND n.type = $3" : "";
            const delResult = await client.query(
                `DELETE FROM notifications n
                 WHERE (
                     n.created_by = $1
                     OR (n.created_by IS NULL AND (
                         (n.recipient_role = 'resident' AND EXISTS (
                             SELECT 1 FROM residents r
                             WHERE r.id = n.recipient_id AND LOWER(r.kifle_ketema) = LOWER($2)
                         ))
                         OR (n.recipient_role = 'business_owner' AND EXISTS (
                             SELECT 1 FROM business_owners b
                             WHERE b.business_id = n.recipient_id AND LOWER(b.kifle_ketema) = LOWER($2)
                         ))
                         OR (n.recipient_role = 'collector' AND EXISTS (
                             SELECT 1 FROM collectors c
                             WHERE c.id = n.recipient_id AND LOWER(c.kifle_ketema) = LOWER($2)
                         ))
                     ))
                 )${typeClause}`,
                request.notification_type
                    ? [request.municipal_admin_id, request.kifle_ketema, request.notification_type]
                    : [request.municipal_admin_id, request.kifle_ketema]
            );
            deletedNotifications = delResult.rowCount;
        }

        if (request.request_type === "reports" || request.request_type === "all") {
            const delResult = await client.query(deleteScopedReportsSQL, [
                request.kifle_ketema,
            ]);
            deletedReports = delResult.rowCount;
        }

        if (request.request_type === "schedule_issues") {
            const scheduleResult = await client.query(deleteScopedScheduleIssuesSQL, [
                request.kifle_ketema,
            ]);
            deletedScheduleIssues = scheduleResult.rowCount;
        }

        const updateResult = await client.query(
            `UPDATE delete_requests
             SET status = 'approved',
                 reviewed_by = $2,
                 reviewed_at = CURRENT_TIMESTAMP,
                 deleted_notifications = $3,
                 deleted_reports = $4,
                 deleted_schedule_issues = $5
             WHERE id = $1
             RETURNING *`,
            [requestId, reviewerId, deletedNotifications, deletedReports, deletedScheduleIssues]
        );

        await client.query("COMMIT");

        return { request: updateResult.rows[0], deletedNotifications, deletedReports, deletedScheduleIssues };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

exports.denyRequest = async (requestId, reviewerId) => {
    const result = await pool.query(
        `UPDATE delete_requests
         SET status = 'denied',
             reviewed_by = $2,
             reviewed_at = CURRENT_TIMESTAMP,
             deleted_notifications = 0,
             deleted_reports = 0,
             deleted_schedule_issues = 0
         WHERE id = $1 AND status = 'pending'
         RETURNING *`,
        [requestId, reviewerId]
    );

    if (!result.rows.length) {
        throw new Error("Request not found or already processed");
    }

    return result.rows[0];
};