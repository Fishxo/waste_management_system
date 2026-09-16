const pool = require("../../database/db");

exports.insertActivityLog = async ({
    actorRole,
    actorId,
    actorName,
    actorKifleKetema,
    action,
    entityType,
    entityId,
    details,
}) => {
    const query = `
        INSERT INTO activity_logs
        (actor_role, actor_id, actor_name, actor_kifle_ketema, action, entity_type, entity_id, details)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;

    const result = await pool.query(query, [
        actorRole,
        actorId,
        actorName,
        actorKifleKetema,
        action,
        entityType,
        entityId,
        details ? JSON.stringify(details) : null,
    ]);

    return result.rows[0];
};

// resolve the display name and sub-city for an admin actor
exports.getActorDetails = async (actorRole, actorId) => {
    if (actorRole === "system_admin") {
        const result = await pool.query(
            `SELECT username FROM system_admins WHERE id = $1`,
            [actorId]
        );
        return { name: result.rows[0]?.username || null, kifleKetema: null };
    }

    if (actorRole === "municipal_admin") {
        const result = await pool.query(
            `SELECT username, kifle_ketema FROM municipal_admins WHERE id = $1`,
            [actorId]
        );
        if (!result.rows[0]) {
            return { name: null, kifleKetema: null };
        }
        return {
            name: result.rows[0].username || null,
            kifleKetema: result.rows[0].kifle_ketema || null,
        };
    }

    if (actorRole === "collector") {
        const result = await pool.query(
            `SELECT full_name, kifle_ketema FROM collectors WHERE id = $1`,
            [actorId]
        );
        if (!result.rows[0]) {
            return { name: null, kifleKetema: null };
        }
        return {
            name: result.rows[0].full_name || null,
            kifleKetema: result.rows[0].kifle_ketema || null,
        };
    }

    return { name: null, kifleKetema: null };
};

exports.getActivityLogs = async ({
    actorRole,
    actorName,
    action,
    search,
    page = 1,
    limit = 20,
}) => {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (actorRole) {
        conditions.push(`actor_role = $${paramIndex++}`);
        values.push(actorRole);
    }

    if (actorName) {
        conditions.push(`actor_name = $${paramIndex++}`);
        values.push(actorName);
    }

    if (action) {
        conditions.push(`action = $${paramIndex++}`);
        values.push(action);
    }

    if (search) {
        conditions.push(
            `(actor_name ILIKE $${paramIndex} OR actor_kifle_ketema ILIKE $${paramIndex} OR action ILIKE $${paramIndex} OR entity_type ILIKE $${paramIndex} OR details::text ILIKE $${paramIndex})`
        );
        values.push(`%${search}%`);
        paramIndex++;
    }

    const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countQuery = `SELECT COUNT(*)::int AS total FROM activity_logs ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = countResult.rows[0].total;

    const offset = (page - 1) * limit;
    const dataQuery = `
        SELECT id, actor_role, actor_id, actor_name, actor_kifle_ketema,
               action, entity_type, entity_id, details, created_at
        FROM activity_logs
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;
    values.push(limit, offset);

    const dataResult = await pool.query(dataQuery, values);

    return { logs: dataResult.rows, total, page, limit };
};

exports.getActivityStats = async () => {
    const totalResult = await pool.query(
        `SELECT COUNT(*)::int AS total FROM activity_logs`
    );

    const byActionResult = await pool.query(
        `SELECT action, COUNT(*)::int AS count FROM activity_logs GROUP BY action ORDER BY count DESC`
    );

    const byActorResult = await pool.query(
        `SELECT actor_role, COUNT(*)::int AS count FROM activity_logs GROUP BY actor_role`
    );

    // per-admin breakdown so the system admin can filter by each admin
    const byAdminResult = await pool.query(
        `SELECT actor_role, actor_name, actor_kifle_ketema, COUNT(*)::int AS count
         FROM activity_logs
         GROUP BY actor_role, actor_name, actor_kifle_ketema
         ORDER BY count DESC`
    );

    const byAction = {};
    byActionResult.rows.forEach((row) => {
        byAction[row.action] = row.count;
    });

    const byActor = {};
    byActorResult.rows.forEach((row) => {
        byActor[row.actor_role] = row.count;
    });

    const byAdmin = byAdminResult.rows.map((row) => ({
        role: row.actor_role,
        name: row.actor_name,
        kifleKetema: row.actor_kifle_ketema,
        count: row.count,
    }));

    return {
        total: totalResult.rows[0].total,
        byAction,
        byActor,
        byAdmin,
    };
};