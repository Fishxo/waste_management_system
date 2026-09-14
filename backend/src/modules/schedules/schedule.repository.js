const pool = require("../../database/db");

exports.createSchedule = async (adminId, data) => {
    const hasCollector = Boolean(data.collectorId);
    const query = `
        INSERT INTO schedules
        (
            kifle_ketema,
            kebele,
            sefer,
            collection_date,
            collection_time,
            end_time,
            notes,
            created_by,
            collector_id,
            status
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
    `;

    const values = [
        data.kifleKetema,
        data.kebele,
        data.sefer,
        data.collectionDate,
        data.collectionTime,
        data.collectionEndTime,
        data.notes,
        adminId,
        hasCollector ? data.collectorId : null,
        hasCollector ? 'assigned' : 'scheduled',
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

exports.getAllSchedules = async (kifleKetema) => {
    let query = `
        SELECT
            s.id,
            s.kifle_ketema,
            s.kebele,
            s.sefer,
            s.collection_date,
            s.collection_time,
            s.end_time,
            s.notes,
            s.status,
            s.collector_id,
            s.created_at,
            m.email AS created_by,
            c.full_name AS collector_name
        FROM schedules s
        JOIN municipal_admins m
            ON s.created_by = m.id
        LEFT JOIN collectors c
            ON s.collector_id = c.id
    `;

    const values = [];

    if (kifleKetema) {
        query += ` WHERE s.kifle_ketema = $1`;
        values.push(kifleKetema);
    }

    query += ` ORDER BY s.created_at DESC`;

    const result = await pool.query(query, values);

    return result.rows;
};

exports.getSchedulesByArea = async (kifleKetema) => {
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
            created_at
        FROM schedules
        WHERE kifle_ketema = $1
        ORDER BY collection_date ASC, collection_time ASC
    `;

    const result = await pool.query(query, [kifleKetema]);

    return result.rows;
};

exports.getSchedulesByLocation = async (kifleKetema, kebele) => {
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
            created_at
        FROM schedules
        WHERE kifle_ketema = $1 AND kebele = $2
        ORDER BY collection_date ASC, collection_time ASC
    `;

    const result = await pool.query(query, [kifleKetema, kebele]);

    return result.rows;
};

exports.getScheduleById = async (scheduleId) => {
    const query = `
        SELECT
            id,
            collector_id,
            status
        FROM schedules
        WHERE id = $1
    `;

    const result = await pool.query(query, [scheduleId]);

    return result.rows[0];
};

exports.updateSchedule = async (scheduleId, data) => {
    const query = `
     UPDATE schedules
     SET kifle_ketema = $1,
        kebele = $2,
        sefer = $3,
        collection_date = $4,
        collection_time = $5,
        end_time = $6,
        notes = $7,
        collector_id = $8,
        status = CASE WHEN $8 IS NOT NULL THEN 'assigned' ELSE status END
        WHERE id = $9
         RETURNING *
    `;
    const values = [
        data.kifleKetema,
        data.kebele,
        data.sefer,
        data.collectionDate,
        data.collectionTime,
        data.collectionEndTime,
        data.notes,
        data.collectorId || null,
        scheduleId,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};
