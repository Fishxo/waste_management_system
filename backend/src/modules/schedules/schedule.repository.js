const pool = require("../../database/db");

// create schedule
exports.createSchedule = async (adminId, data) => {

    const query = `
        INSERT INTO schedules
        (
            kifle_ketema,
            kebele,
            sefer,
            collection_day,
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
        data.collectionDay,
        data.collectionTime,
        data.notes,
        adminId,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};


//// get all schedules by admin
exports.getAllSchedules = async () => {

    const query = `
        SELECT
            s.id,
            s.kifle_ketema,
            s.kebele,
            s.sefer,
            s.collection_day,
            s.collection_time,
            s.notes,
            s.created_at,
            m.email AS created_by
        FROM schedules s
        JOIN municipal_admins m
            ON s.created_by = m.id
        ORDER BY s.created_at DESC
    `;

    const result = await pool.query(query);

    return result.rows;
};

// get schedules for a specific sub-city (resident view)
exports.getSchedulesByArea = async (kifleKetema) => {
    const query = `
        SELECT
            id,
            kifle_ketema,
            kebele,
            sefer,
            collection_day,
            collection_time,
            notes,
            created_at
        FROM schedules
        WHERE kifle_ketema = $1
        ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [kifleKetema]);

    return result.rows;
};

//update schedule 
exports.updateSchedule = async (scheduleId, data) => {
    const query = `
     UPDATE schedules
     SET kifle_ketema = $1,
        kebele = $2,
        sefer = $3,
        collection_day = $4,
        collection_time = $5,
        notes = $6
        WHERE id = $7
         RETURNING *
    `
    const values = [
        data.kifleKetema,
        data.kebele,
        data.sefer,
        data.collectionDay,
        data.collectionTime,
        data.notes,
        scheduleId,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
}