const pool = require("../../database/db");
const reportRepository = require("../reports/report.repository");
const {
    getLocationOptionsFor,
} = require("../../constants/locations");

exports.findAdminByEmail = async (email) => {
    const query = `
        SELECT
            id,
            username,
            email,
            password,
            kifle_ketema,
            is_active,
            status,
            created_at
        FROM municipal_admins
        WHERE email = $1
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0];
};

exports.getLocationOptions = async (kifleKetema) => {
    if (!kifleKetema) {
        return { kebeles: [], sefers: [] };
    }

    const canonical = getLocationOptionsFor(kifleKetema);

    if (canonical) {
        return canonical;
    }

    const kebelesResult = await pool.query(
        `
        SELECT DISTINCT norm_kebele AS kebele
        FROM (
            SELECT
                CASE
                    WHEN trim(kebele) ~ '^[0-9]+$'
                        THEN lpad(trim(kebele), 2, '0')
                    ELSE trim(kebele)
                END AS norm_kebele
            FROM (
                SELECT kebele
                FROM residents
                WHERE LOWER(trim(kifle_ketema)) = LOWER(trim($1))
                UNION ALL
                SELECT kebele
                FROM business_owners
                WHERE LOWER(trim(kifle_ketema)) = LOWER(trim($1))
                UNION ALL
                SELECT kebele
                FROM schedules
                WHERE LOWER(trim(kifle_ketema)) = LOWER(trim($1))
            ) loc
        ) t
        WHERE norm_kebele IS NOT NULL AND trim(norm_kebele) <> ''
        ORDER BY kebele
        `,
        [kifleKetema]
    );

    const sefersResult = await pool.query(
        `
        SELECT DISTINCT norm_kebele AS kebele, norm_sefer AS sefer
        FROM (
            SELECT
                CASE
                    WHEN trim(kebele) ~ '^[0-9]+$'
                        THEN lpad(trim(kebele), 2, '0')
                    ELSE trim(kebele)
                END AS norm_kebele,
                CASE
                    WHEN trim(sefer) ~ '^[0-9]+$'
                        THEN lpad(trim(sefer), 2, '0')
                    ELSE trim(sefer)
                END AS norm_sefer
            FROM (
                SELECT kebele, sefer
                FROM residents
                WHERE LOWER(trim(kifle_ketema)) = LOWER(trim($1))
                UNION ALL
                SELECT kebele, sefer
                FROM schedules
                WHERE LOWER(trim(kifle_ketema)) = LOWER(trim($1))
            ) loc
        ) t
        WHERE norm_kebele IS NOT NULL AND trim(norm_kebele) <> ''
          AND norm_sefer IS NOT NULL AND trim(norm_sefer) <> ''
        ORDER BY kebele, sefer
        `,
        [kifleKetema]
    );

    return {
        kebeles: kebelesResult.rows.map((r) => r.kebele),
        sefers: sefersResult.rows.map((r) => ({
            kebele: r.kebele,
            sefer: r.sefer,
        })),
    };
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

exports.getAllReports = async (status, kifleKetema, reporterRole) => {
    let query = `
        SELECT
            r.id,
            r.title,
            r.description,
            r.status,
            r.created_at,
            r.reporter_role,
            res.id AS resident_id,
            res.resident_code,
            res.first_name,
            res.last_name,
            res.email,
            res.kifle_ketema AS resident_kifle_ketema,
            col.id AS collector_id,
            col.full_name AS collector_name,
            col.phone_number AS collector_phone,
            col.kifle_ketema AS collector_kifle_ketema,
            biz.business_id,
            biz.business_code,
            biz.business_name,
            biz.owner_name AS business_owner_name,
            biz.email AS business_email,
            biz.kifle_ketema AS business_kifle_ketema
        FROM reports r
        LEFT JOIN residents res
            ON r.resident_id = res.id
        LEFT JOIN collectors col
            ON r.collector_id = col.id
        LEFT JOIN business_owners biz
            ON r.business_id = biz.business_id
    `;

    const values = [];
    const conditions = [];

    if (kifleKetema) {
        conditions.push(
            `LOWER(COALESCE(res.kifle_ketema, col.kifle_ketema, biz.kifle_ketema)) = LOWER($${values.length + 1})`
        );
        values.push(kifleKetema);
    }

    if (status) {
        conditions.push(`r.status = $${values.length + 1}`);
        values.push(status);
    }

    if (["resident", "business_owner", "collector"].includes(reporterRole)) {
        conditions.push(`r.reporter_role = $${values.length + 1}`);
        values.push(reporterRole);
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
            (SELECT COUNT(*) FROM residents WHERE LOWER(kifle_ketema) = LOWER($1)) AS total_residents,
            (SELECT COUNT(*) FROM reports r
                LEFT JOIN residents res ON r.resident_id = res.id
                LEFT JOIN collectors col ON r.collector_id = col.id
                WHERE LOWER(COALESCE(res.kifle_ketema, col.kifle_ketema)) = LOWER($1)) AS total_reports,
            (SELECT COUNT(*) FROM reports r
                LEFT JOIN residents res ON r.resident_id = res.id
                LEFT JOIN collectors col ON r.collector_id = col.id
                WHERE LOWER(COALESCE(res.kifle_ketema, col.kifle_ketema)) = LOWER($1)
                    AND r.status = 'pending') AS pending_reports,
            (SELECT COUNT(*) FROM reports r
                LEFT JOIN residents res ON r.resident_id = res.id
                LEFT JOIN collectors col ON r.collector_id = col.id
                WHERE LOWER(COALESCE(res.kifle_ketema, col.kifle_ketema)) = LOWER($1)
                    AND r.status = 'in_progress') AS in_progress_reports,
            (SELECT COUNT(*) FROM reports r
                LEFT JOIN residents res ON r.resident_id = res.id
                LEFT JOIN collectors col ON r.collector_id = col.id
                WHERE LOWER(COALESCE(res.kifle_ketema, col.kifle_ketema)) = LOWER($1)
                    AND r.status = 'resolved') AS resolved_reports
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
            resident_code,
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
        query += ` WHERE LOWER(kifle_ketema) = LOWER($1)`;
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
            resident_code,
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
        query += ` AND LOWER(kifle_ketema) = LOWER($2)`;
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
        query += ` AND LOWER(kifle_ketema) = LOWER($2)`;
        values.push(kifleKetema);
    }

    query += ` RETURNING id, resident_code, first_name, last_name, email`;

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
        query += ` AND LOWER(kifle_ketema) = LOWER($3)`;
        values.push(kifleKetema);
    }

    query += `
        RETURNING
            id,
            resident_code,
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
            business_code,
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
        query += ` WHERE LOWER(kifle_ketema) = LOWER($1)`;
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
            business_code,
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
        query += ` AND LOWER(kifle_ketema) = LOWER($2)`;
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
        query += ` AND LOWER(kifle_ketema) = LOWER($2)`;
        values.push(kifleKetema);
    }

    query += ` RETURNING business_id, business_code, business_name, owner_name, email`;

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
        query += ` AND LOWER(kifle_ketema) = LOWER($3)`;
        values.push(kifleKetema);
    }

    query += `
        RETURNING
            business_id,
            business_code,
            business_name,
            owner_name,
            email,
            is_active
    `;

    const result = await pool.query(query, values);

    return result.rows[0] || null;
};
