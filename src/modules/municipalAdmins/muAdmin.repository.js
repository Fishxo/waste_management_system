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