const pool = require("../../database/db");

exports.createSchedule = async (adminId, data) => {
    const query = `
        INSERT INTO schedules
        (
            kifle_ketema,
            kebele,
            sefer,
            collection_date,
            collection_time,
            notes,
            created_by
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
    `;

    const values = [
        data.kifleKetema,
        data.kebele,
        data.sefer,
        data.collectionDate,
        data.collectionTime,
        data.notes,
        adminId,
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
            notes,
            created_at
        FROM schedules
        WHERE kifle_ketema = $1 AND kebele = $2
        ORDER BY collection_date ASC, collection_time ASC
    `;

    const result = await pool.query(query, [kifleKetema, kebele]);

    return result.rows;
};

exports.updateSchedule = async (scheduleId, data) => {
    const query = `
     UPDATE schedules
     SET kifle_ketema = $1,
        kebele = $2,
        sefer = $3,
        collection_date = $4,
        collection_time = $5,
        notes = $6
        WHERE id = $7
         RETURNING *
    `;
    const values = [
        data.kifleKetema,
        data.kebele,
        data.sefer,
        data.collectionDate,
        data.collectionTime,
        data.notes,
        scheduleId,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};
