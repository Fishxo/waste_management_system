const pool = require("../../database/db");
const reportRepository = require("../reports/report.repository");
exports.findAdminByEmail = async (email) => {
    const query = `
        SELECT
            id,
            username,
            email,
            password,
            created_at
        FROM municipal_admins
        WHERE email = $1
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0];
};

//making an update the report status
exports.updateReportStatus = async (reportId, status) => {
    const report = await reportRepository.updateReportStatus(
        reportId,
        status
    );

    if (!report) {
        throw new Error("Report not found");
    }

    return report;
};

//getting all reports made by the whole resident or by thir status if status reuiest exist 


exports.getAllReports = async (status) => {
    let query = `
        SELECT
            r.id,
            r.title,
            r.description,
            r.status,
            r.created_at,
            res.id AS resident_id,
            res.first_name,
            res.last_name,
            res.email
        FROM reports r
        JOIN residents res
            ON r.resident_id = res.id
    `;

    const values = [];

    if (status) {
        query += ` WHERE r.status = $1`;
        values.push(status);
    }

    query += ` ORDER BY r.created_at DESC`;

    const result = await pool.query(query, values);

    return result.rows;
};

//getting admin dashboard numbers 
exports.getDashboardStatistics = async () => {
    const query = `
        SELECT
            (SELECT COUNT(*) FROM residents) AS total_residents,
            (SELECT COUNT(*) FROM reports) AS total_reports,
            (SELECT COUNT(*) FROM reports WHERE status = 'pending') AS pending_reports,
            (SELECT COUNT(*) FROM reports WHERE status = 'in_progress') AS in_progress_reports,
            (SELECT COUNT(*) FROM reports WHERE status = 'resolved') AS resolved_reports
    `;

    const result = await pool.query(query);

    return result.rows[0];
};

//getting the whole residnet 
exports.getAllResidents = async () => {

    const query = `
        SELECT
            id,
            first_name,
            last_name,
            email,
            phone_number,
            kifle_ketema,
            kebele,
            sefer,
            created_at,
            is_active
        FROM residents
        ORDER BY created_at DESC
    `;

    const result = await pool.query(query);

    return result.rows;
};

//getting resident by its id 
exports.getResidentById = async (id) => {

    const query = `
        SELECT
            id,
            first_name,
            last_name,
            email,
            phone_number,
            kifle_ketema,
            kebele,
            sefer,
            created_at,
            is_active
        FROM residents
        WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
};

//making delete the user from admin dashboaurd 
exports.deleteResidentById = async (id) => {
    const result = await pool.query(
        `DELETE FROM residents
        WHERE id = $1
        RETURNING id, first_name, last_name, email`,
        [id]
    );
    return result.rows[0] || null;
}

//making the resident deactivate 
exports.updateResidentActive = async (id, isActive) => {
  const result = await pool.query(
    `
    UPDATE residents
    SET is_active = $2
    WHERE id = $1
    RETURNING
      id,
      first_name,
      last_name,
      email,
      is_active
    `,
    [id, isActive]
  );

  return result.rows[0] || null;
};