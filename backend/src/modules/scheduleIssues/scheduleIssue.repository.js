const pool = require("../../database/db");

exports.findScheduleById = async (scheduleId) => {
    const query = `
        SELECT
            id,
            kifle_ketema,
            kebele,
            sefer,
            collection_date,
            collection_time,
            notes,
            created_at
        FROM schedules
        WHERE id = $1
    `;

    const result = await pool.query(query, [scheduleId]);

    return result.rows[0];
};

exports.findById = async (issueId) => {
    const query = `
        SELECT
            id,
            schedule_id,
            resident_id,
            description,
            status,
            created_at
        FROM schedule_issues
        WHERE id = $1
    `;

    const result = await pool.query(query, [issueId]);

    return result.rows[0];
};

exports.findActiveIssue = async (residentId, scheduleId) => {
    const query = `
        SELECT
            id,
            schedule_id,
            resident_id,
            description,
            status,
            created_at
        FROM schedule_issues
        WHERE resident_id = $1
          AND schedule_id = $2
          AND status IN ('pending', 'reviewing')
        LIMIT 1
    `;

    const result = await pool.query(query, [residentId, scheduleId]);

    return result.rows[0];
};

exports.createIssue = async (scheduleId, residentId, description) => {
    const query = `
        INSERT INTO schedule_issues
        (schedule_id, resident_id, description)
        VALUES ($1, $2, $3)
        RETURNING *
    `;

    const result = await pool.query(query, [
        scheduleId,
        residentId,
        description,
    ]);

    return result.rows[0];
};

exports.getAllIssues = async (status, kifleKetema) => {
    let query = `
        SELECT
            si.id,
            si.schedule_id,
            si.resident_id,
            si.description,
            si.status,
            si.created_at,
            r.first_name,
            r.last_name,
            r.email,
            r.phone_number,
            s.kifle_ketema,
            s.kebele,
            s.sefer,
            s.collection_date,
            s.collection_time
        FROM schedule_issues si
        JOIN schedules s
            ON si.schedule_id = s.id
        JOIN residents r
            ON si.resident_id = r.id
    `;

    const values = [];
    const conditions = [];

    if (kifleKetema) {
        conditions.push(`s.kifle_ketema = $${values.length + 1}`);
        values.push(kifleKetema);
    }

    if (status) {
        conditions.push(`si.status = $${values.length + 1}`);
        values.push(status);
    }

    if (conditions.length) {
        query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY si.created_at DESC`;

    const result = await pool.query(query, values);

    return result.rows;
};

exports.getIssuesByResidentId = async (residentId) => {
    const query = `
        SELECT
            si.id,
            si.schedule_id,
            si.description,
            si.status,
            si.created_at,
            s.kifle_ketema,
            s.kebele,
            s.sefer,
            s.collection_date,
            s.collection_time
        FROM schedule_issues si
        JOIN schedules s
            ON si.schedule_id = s.id
        WHERE si.resident_id = $1
        ORDER BY si.created_at DESC
    `;

    const result = await pool.query(query, [residentId]);

    return result.rows;
};

exports.updateStatus = async (issueId, status) => {
    const query = `
        UPDATE schedule_issues
        SET status = $1
        WHERE id = $2
        RETURNING *
    `;

    const result = await pool.query(query, [status, issueId]);

    return result.rows[0];
};
