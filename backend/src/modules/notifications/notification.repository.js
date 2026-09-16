const pool = require("../../database/db");

exports.createNotification = async ({
    recipientRole,
    recipientId,
    title,
    message,
    type,
    createdBy = null,
}) => {
    const query = `
        INSERT INTO notifications
        (recipient_role, recipient_id, title, message, type, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;

    const result = await pool.query(query, [
        recipientRole,
        recipientId,
        title,
        message,
        type,
        createdBy,
    ]);

    return result.rows[0];
};

exports.createBulkNotifications = async (notifications) => {
    if (!notifications.length) return [];

    const values = [];
    const placeholders = notifications.map((n, index) => {
        const offset = index * 6;
        values.push(
            n.recipientRole,
            n.recipientId,
            n.title,
            n.message,
            n.type,
            n.createdBy || null
        );
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
    });

    const query = `
        INSERT INTO notifications
        (recipient_role, recipient_id, title, message, type, created_by)
        VALUES ${placeholders.join(", ")}
        RETURNING *
    `;

    const result = await pool.query(query, values);

    return result.rows;
};

exports.getNotificationsForUser = async (recipientRole, recipientId) => {
    const query = `
        SELECT id, recipient_role, recipient_id, title, message, type, is_read, created_at
        FROM notifications
        WHERE recipient_role = $1 AND recipient_id = $2
        ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [recipientRole, recipientId]);

    return result.rows;
};

exports.getUnreadCount = async (recipientRole, recipientId) => {
    const query = `
        SELECT COUNT(*)::int AS count
        FROM notifications
        WHERE recipient_role = $1 AND recipient_id = $2 AND is_read = false
    `;

    const result = await pool.query(query, [recipientRole, recipientId]);

    return result.rows[0].count;
};

exports.markAsRead = async (notificationId, recipientRole, recipientId) => {
    const query = `
        UPDATE notifications
        SET is_read = true
        WHERE id = $1 AND recipient_role = $2 AND recipient_id = $3
        RETURNING *
    `;

    const result = await pool.query(query, [
        notificationId,
        recipientRole,
        recipientId,
    ]);

    return result.rows[0];
};

exports.markAllAsRead = async (recipientRole, recipientId) => {
    const query = `
        UPDATE notifications
        SET is_read = true
        WHERE recipient_role = $1 AND recipient_id = $2 AND is_read = false
        RETURNING id
    `;

    const result = await pool.query(query, [recipientRole, recipientId]);

    return result.rows;
};

exports.getResidentIdsByArea = async (kifleKetema, kebele) => {
    const query = `
        SELECT id FROM residents
        WHERE LOWER(kifle_ketema) = LOWER($1) AND kebele = $2 AND is_active = true
    `;

    const result = await pool.query(query, [kifleKetema, kebele]);

    return result.rows.map((row) => row.id);
};

exports.getBusinessOwnerIdsByArea = async (kifleKetema, kebele) => {
    const query = `
        SELECT business_id AS id FROM business_owners
        WHERE LOWER(kifle_ketema) = LOWER($1) AND kebele = $2
    `;

    const result = await pool.query(query, [kifleKetema, kebele]);

    return result.rows.map((row) => row.id);
};

exports.getAllRecipientIds = async (recipientRole, kifleKetema = null) => {
    if (recipientRole === "resident") {
        let query = `SELECT id FROM residents WHERE is_active = true`;
        const values = [];
        if (kifleKetema) {
            query += ` AND LOWER(kifle_ketema) = LOWER($1)`;
            values.push(kifleKetema);
        }
        const result = await pool.query(query, values);
        return result.rows.map((row) => row.id);
    }

    if (recipientRole === "business_owner") {
        let query = `SELECT business_id AS id FROM business_owners`;
        const values = [];
        if (kifleKetema) {
            query += ` WHERE LOWER(kifle_ketema) = LOWER($1)`;
            values.push(kifleKetema);
        }
        const result = await pool.query(query, values);
        return result.rows.map((row) => row.id);
    }

    if (recipientRole === "collector") {
        let query = `SELECT id FROM collectors WHERE is_active = true`;
        const values = [];
        if (kifleKetema) {
            query += ` AND LOWER(kifle_ketema) = LOWER($1)`;
            values.push(kifleKetema);
        }
        const result = await pool.query(query, values);
        return result.rows.map((row) => row.id);
    }

    return [];
};

exports.getNotificationsForAdmin = async ({ adminId, adminKifle, recipientRole, type, search, page = 1, limit = 20 }) => {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    const scopeClauses = [];
    if (adminId) {
        scopeClauses.push(`n.created_by = $${paramIndex++}`);
        values.push(adminId);
    }

    if (adminKifle) {
        scopeClauses.push(`(
            n.created_by IS NULL
            AND (
                (n.recipient_role = 'resident'
                    AND EXISTS (
                        SELECT 1 FROM residents r
                        WHERE r.id = n.recipient_id
                            AND LOWER(r.kifle_ketema) = LOWER($${paramIndex})
                    ))
                OR (n.recipient_role = 'collector'
                    AND EXISTS (
                        SELECT 1 FROM collectors c
                        WHERE c.id = n.recipient_id
                            AND LOWER(c.kifle_ketema) = LOWER($${paramIndex})
                    ))
                OR (n.recipient_role = 'business_owner'
                    AND EXISTS (
                        SELECT 1 FROM business_owners b
                        WHERE b.business_id = n.recipient_id
                            AND LOWER(b.kifle_ketema) = LOWER($${paramIndex})
                    ))
            )
        )`);
        values.push(adminKifle);
        paramIndex++;
    }

    if (scopeClauses.length) {
        conditions.push(`(${scopeClauses.join(" OR ")})`);
    }

    if (recipientRole) {
        conditions.push(`n.recipient_role = $${paramIndex++}`);
        values.push(recipientRole);
    }

    if (type) {
        conditions.push(`n.type = $${paramIndex++}`);
        values.push(type);
    }

    if (search) {
        conditions.push(`(n.title ILIKE $${paramIndex} OR n.message ILIKE $${paramIndex})`);
        values.push(`%${search}%`);
        paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countQuery = `SELECT COUNT(*)::int AS total FROM notifications n ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = countResult.rows[0].total;

    const offset = (page - 1) * limit;
    const dataQuery = `
        SELECT n.id, n.recipient_role, n.recipient_id, n.title, n.message,
               n.type, n.is_read, n.created_at,
               ma.username AS sent_by_name
        FROM notifications n
        LEFT JOIN municipal_admins ma ON n.created_by = ma.id
        ${whereClause}
        ORDER BY n.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;
    values.push(limit, offset);

    const dataResult = await pool.query(dataQuery, values);

    return { notifications: dataResult.rows, total, page, limit };
};

exports.getNotificationStats = async (adminId = null, adminKifle = null) => {
    const scopeClauses = [];
    const params = [];

    if (adminId) {
        scopeClauses.push(`n.created_by = $${params.length + 1}`);
        params.push(adminId);
    }

    if (adminKifle) {
        scopeClauses.push(`(
            n.created_by IS NULL
            AND (
                (n.recipient_role = 'resident'
                    AND EXISTS (
                        SELECT 1 FROM residents r
                        WHERE r.id = n.recipient_id
                            AND LOWER(r.kifle_ketema) = LOWER($${params.length + 1})
                    ))
                OR (n.recipient_role = 'collector'
                    AND EXISTS (
                        SELECT 1 FROM collectors c
                        WHERE c.id = n.recipient_id
                            AND LOWER(c.kifle_ketema) = LOWER($${params.length + 1})
                    ))
                OR (n.recipient_role = 'business_owner'
                    AND EXISTS (
                        SELECT 1 FROM business_owners b
                        WHERE b.business_id = n.recipient_id
                            AND LOWER(b.kifle_ketema) = LOWER($${params.length + 1})
                    ))
            )
        )`);
        params.push(adminKifle);
    }

    const where = scopeClauses.length
        ? `WHERE (${scopeClauses.join(" OR ")})`
        : "";

    const totalQuery = `SELECT COUNT(*)::int AS total FROM notifications n ${where}`;
    const totalResult = await pool.query(totalQuery, params);

    const roleQuery = `
        SELECT n.recipient_role, COUNT(*)::int AS count
        FROM notifications n
        ${where}
        GROUP BY n.recipient_role
    `;
    const roleResult = await pool.query(roleQuery, params);

    const typeQuery = `
        SELECT n.type, COUNT(*)::int AS count
        FROM notifications n
        ${where}
        GROUP BY n.type
    `;
    const typeResult = await pool.query(typeQuery, params);

    const byRole = {};
    roleResult.rows.forEach((row) => {
        byRole[row.recipient_role] = row.count;
    });

    const byType = {};
    typeResult.rows.forEach((row) => {
        byType[row.type] = row.count;
    });

    return {
        total: totalResult.rows[0].total,
        byRole,
        byType,
    };
};
