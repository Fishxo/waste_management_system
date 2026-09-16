const pool = require("../../database/db");

exports.createThread = async (municipalAdminId, subject, message) => {
    const query = `
        INSERT INTO admin_comments (parent_id, sender_role, municipal_admin_id, subject, message)
        VALUES (NULL, 'municipal_admin', $1, $2, $3)
        RETURNING id, parent_id, sender_role, municipal_admin_id, subject, message, is_read, created_at
    `;
    const result = await pool.query(query, [municipalAdminId, subject, message]);
    return result.rows[0];
};

exports.getThreadsByAdmin = async (municipalAdminId) => {
    const query = `
        SELECT
            t.id,
            t.subject,
            t.message,
            t.is_read,
            t.created_at,
            (SELECT COUNT(*)::int
             FROM admin_comments r
             WHERE r.parent_id = t.id) AS reply_count,
            (SELECT COUNT(*)::int
             FROM admin_comments r
             WHERE r.parent_id = t.id
               AND r.sender_role = 'system_admin'
               AND r.is_read = FALSE) AS unread_replies,
            (SELECT MAX(r.created_at)
             FROM admin_comments r
             WHERE r.parent_id = t.id) AS last_reply_at
        FROM admin_comments t
        WHERE t.municipal_admin_id = $1 AND t.parent_id IS NULL
        ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query, [municipalAdminId]);
    return result.rows;
};

exports.getThreadWithMessages = async (threadId, municipalAdminId) => {
    const thread = await pool.query(
        `SELECT id, municipal_admin_id
         FROM admin_comments
         WHERE id = $1 AND parent_id IS NULL`,
        [threadId]
    );

    if (!thread.rows.length) return null;

    if (thread.rows[0].municipal_admin_id !== municipalAdminId) {
        return { accessDenied: true };
    }

    await pool.query(
        `UPDATE admin_comments
         SET is_read = TRUE
         WHERE parent_id = $1 AND sender_role = 'system_admin' AND is_read = FALSE`,
        [threadId]
    );

    const messages = await pool.query(
        `SELECT m.id, m.parent_id, m.sender_role, m.subject, m.message, m.is_read, m.created_at,
                ma.username AS sender_name
         FROM admin_comments m
         LEFT JOIN municipal_admins ma ON m.municipal_admin_id = ma.id
         WHERE m.id = $1 OR m.parent_id = $1
         ORDER BY m.created_at ASC`,
        [threadId]
    );

    return { thread: thread.rows[0], messages: messages.rows };
};

exports.getAllThreads = async () => {
    const query = `
        SELECT
            t.id,
            t.subject,
            t.message,
            t.is_read,
            t.created_at,
            ma.id AS municipal_admin_id,
            ma.username AS municipal_admin_name,
            ma.email AS municipal_admin_email,
            ma.kifle_ketema,
            (SELECT COUNT(*)::int
             FROM admin_comments r
             WHERE r.parent_id = t.id) AS reply_count,
            (SELECT COUNT(*)::int
             FROM admin_comments r
             WHERE r.parent_id = t.id
               AND r.sender_role = 'municipal_admin'
               AND r.is_read = FALSE) AS unread_messages,
            (SELECT MAX(r.created_at)
             FROM admin_comments r
             WHERE r.parent_id = t.id) AS last_reply_at
        FROM admin_comments t
        LEFT JOIN municipal_admins ma ON t.municipal_admin_id = ma.id
        WHERE t.parent_id IS NULL
        ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

exports.getThreadWithMessagesSysAdmin = async (threadId) => {
    const thread = await pool.query(
        `SELECT id, municipal_admin_id
         FROM admin_comments
         WHERE id = $1 AND parent_id IS NULL`,
        [threadId]
    );

    if (!thread.rows.length) return null;

    await pool.query(
        `UPDATE admin_comments
         SET is_read = TRUE
         WHERE sender_role = 'municipal_admin' AND is_read = FALSE
           AND (id = $1 OR parent_id = $1)`,
        [threadId]
    );

    const messages = await pool.query(
        `SELECT m.id, m.parent_id, m.sender_role, m.subject, m.message, m.is_read, m.created_at,
                CASE
                    WHEN m.sender_role = 'municipal_admin' THEN ma.username
                    ELSE 'System Administrator'
                END AS sender_name
         FROM admin_comments m
         LEFT JOIN municipal_admins ma ON m.municipal_admin_id = ma.id
         WHERE m.id = $1 OR m.parent_id = $1
         ORDER BY m.created_at ASC`,
        [threadId]
    );

    return { thread: thread.rows[0], messages: messages.rows };
};

exports.addReply = async (threadId, municipalAdminId, senderRole, message) => {
    return pool.query(
        `INSERT INTO admin_comments (parent_id, sender_role, municipal_admin_id, subject, message)
         SELECT id, $4, municipal_admin_id, subject, $5
         FROM admin_comments
         WHERE id = $1 AND parent_id IS NULL
           AND ($2 = 'system_admin' OR municipal_admin_id = $3)
         RETURNING id, parent_id, sender_role, municipal_admin_id, subject, message, is_read, created_at`,
        [threadId, senderRole, municipalAdminId, senderRole, message]
    );
};

exports.getUnreadCount = async () => {
    const result = await pool.query(
        `SELECT COUNT(*)::int AS count
         FROM admin_comments
         WHERE parent_id IS NULL AND sender_role = 'municipal_admin' AND is_read = FALSE`
    );
    return result.rows[0].count;
};

exports.getUnreadRepliesForAdmin = async (municipalAdminId) => {
    const result = await pool.query(
        `SELECT COUNT(*)::int AS count
         FROM admin_comments r
         WHERE r.sender_role = 'system_admin' AND r.is_read = FALSE
           AND EXISTS (
               SELECT 1 FROM admin_comments t
               WHERE t.id = r.parent_id AND t.municipal_admin_id = $1
           )`,
        [municipalAdminId]
    );
    return result.rows[0].count;
};