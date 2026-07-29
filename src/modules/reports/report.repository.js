const pool = require("../../database/db");
//creating the users reports for database 
exports.createReport = async (residentId, data) => {
    const query = `
        INSERT INTO reports
        (resident_id, title, description)
        VALUES ($1, $2, $3)
        RETURNING *
    `;

    const values = [
        residentId,
        data.title,
        data.description
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

//getting the reports for resident
exports.getReportsByResidentId = async (residentId) => {
    const query = `
        SELECT
            id,
            resident_id,
            title,
            description,
            status,
            created_at
        FROM reports
        WHERE resident_id = $1
        ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [residentId]);

    return result.rows;
};

//getting a report using specifice id 
exports.getReportById = async (reportId, residentId) => {
    const query = `
        SELECT
            id,
            resident_id,
            title,
            description,
            status,
            created_at
        FROM reports
        WHERE id = $1 AND resident_id = $2
    `;

    const result = await pool.query(query, [reportId, residentId]);

    return result.rows[0];
};

// updating report status by municipal admin
exports.updateReportStatus = async (reportId, status) => {
    const query = `
        UPDATE reports
        SET status = $1
        WHERE id = $2
        RETURNING *
    `;

    const result = await pool.query(query, [status, reportId]);

    return result.rows[0];
};