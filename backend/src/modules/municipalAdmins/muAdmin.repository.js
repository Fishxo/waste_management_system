const pool = require("../../database/db");
const reportRepository = require("../reports/report.repository");

exports.findAdminByEmail = async (email) => {
    const query = `
        SELECT
            id,
            username,
            email,
            password,
            kifle_ketema,
            created_at
        FROM municipal_admins
        WHERE email = $1
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0];
};

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

exports.getAllReports = async (status, kifleKetema) => {
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
    const conditions = [];

    if (kifleKetema) {
        conditions.push(`res.kifle_ketema = $${values.length + 1}`);
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

exports.getDashboardStatistics = async (kifleKetema) => {
    const values = kifleKetema ? [kifleKetema] : [];

    const query = kifleKetema
        ? `
        SELECT
            (SELECT COUNT(*) FROM residents WHERE kifle_ketema = $1) AS total_residents,
            (SELECT COUNT(*) FROM reports r JOIN residents res ON r.resident_id = res.id WHERE res.kifle_ketema = $1) AS total_reports,
            (SELECT COUNT(*) FROM reports r JOIN residents res ON r.resident_id = res.id WHERE res.kifle_ketema = $1 AND r.status = 'pending') AS pending_reports,
            (SELECT COUNT(*) FROM reports r JOIN residents res ON r.resident_id = res.id WHERE res.kifle_ketema = $1 AND r.status = 'in_progress') AS in_progress_reports,
            (SELECT COUNT(*) FROM reports r JOIN residents res ON r.resident_id = res.id WHERE res.kifle_ketema = $1 AND r.status = 'resolved') AS resolved_reports
        `
        : `
        SELECT
            (SELECT COUNT(*) FROM residents) AS total_residents,
            (SELECT COUNT(*) FROM reports) AS total_reports,
            (SELECT COUNT(*) FROM reports WHERE status = 'pending') AS pending_reports,
            (SELECT COUNT(*) FROM reports WHERE status = 'in_progress') AS in_progress_reports,
            (SELECT COUNT(*) FROM reports WHERE status = 'resolved') AS resolved_reports
        `;

    const result = await pool.query(query, values);

    return result.rows[0];
};

exports.getAllResidents = async (kifleKetema) => {
    let query = `
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

exports.getResidentById = async (id, kifleKetema) => {
    let query = `
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

    const values = [id];

    if (kifleKetema) {
        query += ` AND kifle_ketema = $2`;
        values.push(kifleKetema);
    }

    const result = await pool.query(query, values);

    return result.rows[0];
};

exports.deleteResidentById = async (id, kifleKetema) => {
    let query = `
        DELETE FROM residents
        WHERE id = $1
    `;
    const values = [id];

    if (kifleKetema) {
        query += ` AND kifle_ketema = $2`;
        values.push(kifleKetema);
    }

    query += ` RETURNING id, first_name, last_name, email`;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

exports.updateResidentActive = async (id, isActive, kifleKetema) => {
    let query = `
        UPDATE residents
        SET is_active = $2
        WHERE id = $1
    `;
    const values = [id, isActive];

    if (kifleKetema) {
        query += ` AND kifle_ketema = $3`;
        values.push(kifleKetema);
    }

    query += `
        RETURNING
            id,
            first_name,
            last_name,
            email,
            is_active
    `;

    const result = await pool.query(query, values);

    return result.rows[0] || null;
};

exports.getAllBusinessOwners = async (kifleKetema) => {
    let query = `
        SELECT
            business_id,
            business_name,
            owner_name,
            email,
            phone_number,
            address,
            business_type,
            kebele,
            kifle_ketema,
            created_at,
            is_active
        FROM business_owners
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

exports.getBusinessOwnerById = async (id, kifleKetema) => {
    let query = `
        SELECT
            business_id,
            business_name,
            owner_name,
            email,
            phone_number,
            address,
            business_type,
            kebele,
            kifle_ketema,
            created_at,
            is_active
        FROM business_owners
        WHERE business_id = $1
    `;

    const values = [id];

    if (kifleKetema) {
        query += ` AND kifle_ketema = $2`;
        values.push(kifleKetema);
    }

    const result = await pool.query(query, values);

    return result.rows[0];
};

exports.deleteBusinessOwnerById = async (id, kifleKetema) => {
    let query = `
        DELETE FROM business_owners
        WHERE business_id = $1
    `;
    const values = [id];

    if (kifleKetema) {
        query += ` AND kifle_ketema = $2`;
        values.push(kifleKetema);
    }

    query += ` RETURNING business_id, business_name, owner_name, email`;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

exports.updateBusinessOwnerActive = async (id, isActive, kifleKetema) => {
    let query = `
        UPDATE business_owners
        SET is_active = $2
        WHERE business_id = $1
    `;
    const values = [id, isActive];

    if (kifleKetema) {
        query += ` AND kifle_ketema = $3`;
        values.push(kifleKetema);
    }

    query += `
        RETURNING
            business_id,
            business_name,
            owner_name,
            email,
            is_active
    `;

    const result = await pool.query(query, values);

    return result.rows[0] || null;
};
