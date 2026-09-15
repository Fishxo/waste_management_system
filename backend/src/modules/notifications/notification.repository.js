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
