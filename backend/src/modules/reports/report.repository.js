const pool = require("../../database/db");

// Legacy schedule issues were saved in reports before schedule_issues existed.
const LEGACY_SCHEDULE_ISSUE_FILTER = `
    description NOT LIKE '%Related collection schedule:%'
`;
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
          AND ${LEGACY_SCHEDULE_ISSUE_FILTER}
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
        WHERE id = $1
          AND resident_id = $2
          AND ${LEGACY_SCHEDULE_ISSUE_FILTER}
    `;

    const result = await pool.query(query, [reportId, residentId]);

    return result.rows[0];
};

// updating report status by municipal admin + saving history
exports.updateReportStatus = async (reportId, status, adminId) => {

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // get current status before update
        const oldStatusResult = await client.query(
            `
            SELECT status
            FROM reports
            WHERE id = $1
            `,
            [reportId]
        );

        if (oldStatusResult.rows.length === 0) {
            throw new Error("Report not found");
        }

        const oldStatus = oldStatusResult.rows[0].status;


        // update report status
        const updateResult = await client.query(
            `
            UPDATE reports
            SET status = $1
            WHERE id = $2
            RETURNING *
            `,
            [status, reportId]
        );


        // insert history record
        await client.query(
            `
            INSERT INTO report_status_history
            (
                report_id,
                old_status,
                new_status,
                changed_by
            )
            VALUES ($1, $2, $3, $4)
            `,
            [
                reportId,
                oldStatus,
                status,
                adminId
            ]
        );


        await client.query("COMMIT");

        return updateResult.rows[0];


    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();

    }
};

// getting report status history
exports.getReportHistory = async (reportId) => {

    const query = `
        SELECT
            id,
            report_id,
            old_status,
            new_status,
            changed_by,
            changed_at
        FROM report_status_history
        WHERE report_id = $1
        ORDER BY changed_at ASC
    `;

    const result = await pool.query(query, [reportId]);

    return result.rows;
};

//counting the reports a resident created today
exports.countReportsToday = async (residentId) => {
    const query = `
        SELECT COUNT(*)::int AS count
        FROM reports
        WHERE resident_id = $1
          AND created_at >= CURRENT_DATE
          AND ${LEGACY_SCHEDULE_ISSUE_FILTER}
    `;

    const result = await pool.query(query, [residentId]);

    return result.rows[0].count;
};

//checking the report is existing 
exports.findById = async (reportId) => {
    const result = await pool.query(
        "SELECT * FROM reports WHERE id = $1",
        [reportId]
    );
    return result.rows[0];
}

//making update report is functional
exports.updateReport = async (reportId, data) => {
    const { title, description } = data;

    const result = await pool.query(
        `UPDATE reports
        SET title = $1,
        description = $2
        WHERE id = $3
        RETURNING *`,
        [title, description, reportId]
    );
    return result.rows[0];
}

//making delete the report from the resdident side 
exports.deleteReport = async (id) => {
   

    const result = await pool.query(
        `DELETE FROM reports
        WHERE id = $1
        RETURNING id,title,description`, [id]
    );
    return result.rows[0]|| null;
}