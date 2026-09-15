const pool = require("../../database/db");

exports.createRequest = async (businessId, data) => {
    const query = `
        INSERT INTO on_demand_requests
        (business_id, latitude, longitude, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;

    const values = [
        businessId,
        data.latitude,
        data.longitude,
        data.description || null,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

exports.getRequestsByBusinessId = async (businessId) => {
    const query = `
        SELECT
            r.id,
            r.business_id,
            r.latitude,
            r.longitude,
            r.description,
            r.status,
            r.admin_notes,
            r.reviewed_at,
            r.collector_id,
            r.collection_status,
            r.assigned_at,
            r.completed_at,
            r.confirmed_at,
            r.collector_notes,
            r.created_at,
            c.full_name AS collector_name
        FROM on_demand_requests r
        LEFT JOIN collectors c ON r.collector_id = c.id
        WHERE r.business_id = $1
        ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query, [businessId]);

    return result.rows;
};

exports.getRequestById = async (requestId, businessId) => {
    const query = `
        SELECT
            id,
            business_id,
            latitude,
            longitude,
            description,
            status,
            admin_notes,
            reviewed_at,
            collector_id,
            collection_status,
            assigned_at,
            completed_at,
            confirmed_at,
            collector_notes,
            created_at
        FROM on_demand_requests
        WHERE id = $1 AND business_id = $2
    `;

    const result = await pool.query(query, [requestId, businessId]);

    return result.rows[0];
};

exports.findById = async (requestId) => {
    const result = await pool.query(
        `SELECT * FROM on_demand_requests WHERE id = $1`,
        [requestId]
    );

    return result.rows[0];
};

exports.getAllRequests = async (status, kifleKetema) => {
    let query = `
        SELECT
            r.id,
            r.business_id,
            r.latitude,
            r.longitude,
            r.description,
            r.status,
            r.admin_notes,
            r.reviewed_at,
            r.collector_id,
            r.collection_status,
            r.assigned_at,
            r.completed_at,
            r.confirmed_at,
            r.collector_notes,
            r.created_at,
            b.business_code,
            b.business_name,
            b.owner_name,
            b.phone_number,
            b.email,
            b.address,
            b.business_type,
            b.kifle_ketema,
            b.kebele,
            c.full_name AS collector_name
        FROM on_demand_requests r
        JOIN business_owners b ON r.business_id = b.business_id
        LEFT JOIN collectors c ON r.collector_id = c.id
    `;

    const values = [];
    const conditions = [];

    if (kifleKetema) {
        conditions.push(`LOWER(b.kifle_ketema) = LOWER($${values.length + 1})`);
        values.push(kifleKetema);
    }

    if (status) {
        conditions.push(`r.status = $${values.length + 1}`);
        values.push(status);
    }

    if (conditions.length) {
        query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY r.created_at DESC`;

    const result = await pool.query(query, values);

    return result.rows;
};

exports.updateRequestStatus = async (
    requestId,
    status,
    adminId,
    adminNotes
) => {
    const query = `
        UPDATE on_demand_requests
        SET
            status = $1,
            admin_notes = $2,
            reviewed_by = $3,
            reviewed_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
    `;

    const result = await pool.query(query, [
        status,
        adminNotes || null,
        adminId,
        requestId,
    ]);

    return result.rows[0];
};

exports.confirmCollection = async (requestId, businessId) => {
    const query = `
        UPDATE on_demand_requests
        SET
            collection_status = 'confirmed',
            confirmed_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND business_id = $2
          AND status = 'approved'
          AND collection_status = 'completed'
        RETURNING *
    `;

    const result = await pool.query(query, [requestId, businessId]);

    return result.rows[0];
};
