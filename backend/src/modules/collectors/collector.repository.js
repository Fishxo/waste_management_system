const pool = require("../../database/db");

exports.createCollector = async (adminId, data) => {
    const query = `
        INSERT INTO collectors
        (full_name, phone_number, email, password_hash, kifle_ketema, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, full_name, phone_number, email, kifle_ketema, is_active, created_at
    `;

    const values = [
        data.fullName,
        data.phoneNumber,
        data.email,
        data.passwordHash,
        data.kifleKetema,
        adminId,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

exports.findCollectorByEmail = async (email) => {
    const query = `
        SELECT id, full_name, phone_number, email, password_hash, kifle_ketema, is_active, created_at
        FROM collectors
        WHERE email = $1
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0];
};

exports.findCollectorByPhone = async (phone) => {
    const query = `
        SELECT id, full_name, phone_number, email, password_hash, kifle_ketema, is_active, created_at
        FROM collectors
        WHERE phone_number = $1
    `;

    const result = await pool.query(query, [phone]);

    return result.rows[0];
};

exports.findCollectorByIdentifier = async (identifier) => {
    const { isEmail } = require("../../utils/authIdentifier");
    return isEmail(identifier)
        ? exports.findCollectorByEmail(identifier)
        : exports.findCollectorByPhone(identifier);
};

exports.findCollectorById = async (id) => {
    const query = `
        SELECT id, full_name, phone_number, email, kifle_ketema, is_active, created_at
        FROM collectors
        WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
};

exports.getAllCollectors = async (kifleKetema) => {
    let query = `
        SELECT id, full_name, phone_number, email, kifle_ketema, is_active, created_at
        FROM collectors
    `;

    const values = [];

    if (kifleKetema) {
        query += ` WHERE kifle_ketema = $1`;
        values.push(kifleKetema);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, values);

    return result.rows;
};

exports.getAssignedSchedules = async (collectorId) => {
    const query = `
        SELECT
            id,
            kifle_ketema,
            kebele,
            sefer,
            collection_date,
            collection_time,
            end_time,
            notes,
            status,
            created_at
        FROM schedules
        WHERE collector_id = $1
        ORDER BY collection_date ASC, collection_time ASC
    `;

    const result = await pool.query(query, [collectorId]);

    return result.rows;
};

exports.getAssignedOnDemandRequests = async (collectorId) => {
    const query = `
        SELECT
            r.id,
            r.latitude,
            r.longitude,
            r.description,
            r.status,
            r.collection_status,
            r.collector_notes,
            r.assigned_at,
            r.completed_at,
            r.created_at,
            b.business_name,
            b.owner_name,
            b.phone_number,
            b.address
        FROM on_demand_requests r
        JOIN business_owners b ON r.business_id = b.business_id
        WHERE r.collector_id = $1 AND r.status = 'approved'
        ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query, [collectorId]);

    return result.rows;
};

exports.updateScheduleCollectionStatus = async (
    scheduleId,
    collectorId,
    status,
    notes
) => {
    const query = `
        UPDATE schedules
        SET status = $1,
            notes = COALESCE($2, notes)
        WHERE id = $3 AND collector_id = $4
        RETURNING *
    `;

    const result = await pool.query(query, [
        status,
        notes || null,
        scheduleId,
        collectorId,
    ]);

    return result.rows[0];
};

exports.updateOnDemandCollectionStatus = async (
    requestId,
    collectorId,
    status,
    notes
) => {
    const query = `
        UPDATE on_demand_requests
        SET collection_status = $1,
            collector_notes = COALESCE($2, collector_notes),
            completed_at = CASE WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
        WHERE id = $3 AND collector_id = $4 AND status = 'approved'
        RETURNING *
    `;

    const result = await pool.query(query, [
        status,
        notes || null,
        requestId,
        collectorId,
    ]);

    return result.rows[0];
};

exports.assignCollectorToSchedule = async (scheduleId, collectorId) => {
    const query = `
        UPDATE schedules
        SET collector_id = $1,
            status = 'assigned'
        WHERE id = $2
        RETURNING *
    `;

    const result = await pool.query(query, [collectorId, scheduleId]);

    return result.rows[0];
};

exports.assignCollectorToRequest = async (requestId, collectorId) => {
    const query = `
        UPDATE on_demand_requests
        SET collector_id = $1,
            collection_status = 'assigned',
            assigned_at = CURRENT_TIMESTAMP,
            completed_at = NULL,
            confirmed_at = NULL,
            collector_notes = NULL
        WHERE id = $2
          AND status = 'approved'
          AND (collection_status IS NULL OR collection_status IN ('unassigned', 'assigned', 'in_progress'))
        RETURNING *
    `;

    const result = await pool.query(query, [collectorId, requestId]);

    return result.rows[0];
};
