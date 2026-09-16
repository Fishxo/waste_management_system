const pool = require("../../database/db");

exports.findByEmail = async (email) => {
    const result = await pool.query(
        `
        SELECT id, username, email, password, is_active, created_at
        FROM system_admins
        WHERE email = $1
        `,
        [email]
    );

    return result.rows[0];
};

exports.getDashboardStats = async () => {
    const result = await pool.query(`
        SELECT
            (SELECT COUNT(*) FROM residents) AS total_residents,
            (SELECT COUNT(*) FROM business_owners) AS total_business_owners,
            (SELECT COUNT(*) FROM municipal_admins) AS total_municipal_admins,
            (SELECT COUNT(*) FROM collectors) AS total_collectors,
            (SELECT COUNT(*) FROM residents WHERE is_active = false) AS inactive_residents,
            (SELECT COUNT(*) FROM business_owners WHERE is_active = false) AS inactive_business_owners,
            (SELECT COUNT(*) FROM collectors WHERE is_active = false) AS inactive_collectors
    `);

    return result.rows[0];
};

exports.getAllMunicipalAdmins = async () => {
    const result = await pool.query(`
        SELECT id, username, email, kifle_ketema, is_active, status,
               resigned_at, resignation_reason, created_at
        FROM municipal_admins
        ORDER BY created_at DESC
    `);

    return result.rows;
};

exports.createMunicipalAdmin = async ({
    username,
    email,
    passwordHash,
    kifleKetema,
}) => {
    const result = await pool.query(
        `
        INSERT INTO municipal_admins (username, email, password, kifle_ketema)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, email, kifle_ketema, is_active, status,
                  resigned_at, resignation_reason, created_at
        `,
        [username, email, passwordHash, kifleKetema || null]
    );

    return result.rows[0];
};

exports.updateMunicipalAdmin = async ({
    id,
    username,
    email,
    kifleKetema,
    passwordHash,
}) => {
    if (passwordHash) {
        const result = await pool.query(
            `
            UPDATE municipal_admins
            SET username = $2, email = $3, kifle_ketema = $4, password = $5
            WHERE id = $1
            RETURNING id, username, email, kifle_ketema, is_active, status,
                  resigned_at, resignation_reason, created_at
            `,
            [id, username, email, kifleKetema || null, passwordHash]
        );

        return result.rows[0] || null;
    }

    const result = await pool.query(
        `
        UPDATE municipal_admins
        SET username = $2, email = $3, kifle_ketema = $4
        WHERE id = $1
        RETURNING id, username, email, kifle_ketema, is_active, status,
                  resigned_at, resignation_reason, created_at
        `,
        [id, username, email, kifleKetema || null]
    );

    return result.rows[0] || null;
};

exports.updateMunicipalAdminStatus = async (id, status, reason) => {
    const isActive = status === "active";
    const isResigned = status === "resigned";
    const result = await pool.query(
        `
        UPDATE municipal_admins
        SET status = $2,
            is_active = $3,
            resigned_at = CASE WHEN $4 THEN CURRENT_TIMESTAMP ELSE NULL END,
            resignation_reason = CASE WHEN $4 THEN $5 ELSE NULL END
        WHERE id = $1
        RETURNING id, username, email, kifle_ketema, is_active, status,
                  resigned_at, resignation_reason, created_at
        `,
        [id, status, isActive, isResigned, reason || null]
    );

    return result.rows[0] || null;
};

exports.getAllCollectors = async () => {
    const result = await pool.query(`
        SELECT
            c.id,
            c.full_name,
            c.phone_number,
            c.email,
            c.kifle_ketema,
            c.is_active,
            c.status,
            c.resigned_at,
            c.resignation_reason,
            c.created_at,
            m.username AS created_by_username
        FROM collectors c
        LEFT JOIN municipal_admins m ON c.created_by = m.id
        ORDER BY c.created_at DESC
    `);

    return result.rows;
};

exports.createCollector = async ({
    fullName,
    phoneNumber,
    email,
    passwordHash,
    kifleKetema,
}) => {
    const result = await pool.query(
        `
        INSERT INTO collectors
        (full_name, phone_number, email, password_hash, kifle_ketema, created_by)
        VALUES ($1, $2, $3, $4, $5, NULL)
        RETURNING id, full_name, phone_number, email, kifle_ketema, is_active, created_at
        `,
        [fullName, phoneNumber, email, passwordHash, kifleKetema]
    );

    return result.rows[0];
};

exports.updateCollector = async ({
    id,
    fullName,
    phoneNumber,
    email,
    kifleKetema,
    passwordHash,
}) => {
    if (passwordHash) {
        const result = await pool.query(
            `
            UPDATE collectors
            SET full_name = $2, phone_number = $3, email = $4,
                kifle_ketema = $5, password_hash = $6
            WHERE id = $1
            RETURNING id, full_name, phone_number, email, kifle_ketema, is_active, created_at
            `,
            [id, fullName, phoneNumber, email, kifleKetema, passwordHash]
        );

        return result.rows[0] || null;
    }

    const result = await pool.query(
        `
        UPDATE collectors
        SET full_name = $2, phone_number = $3, email = $4, kifle_ketema = $5
        WHERE id = $1
        RETURNING id, full_name, phone_number, email, kifle_ketema, is_active, created_at
        `,
        [id, fullName, phoneNumber, email, kifleKetema]
    );

    return result.rows[0] || null;
};

exports.updateCollectorActive = async (id, isActive) => {
    const result = await pool.query(
        `
        UPDATE collectors
        SET is_active = $2,
            status = CASE WHEN $2 THEN 'active' ELSE 'inactive' END,
            resigned_at = NULL,
            resignation_reason = NULL
        WHERE id = $1
        RETURNING id, full_name, email, is_active, status
        `,
        [id, isActive]
    );

    return result.rows[0] || null;
};

exports.getAllResidents = async () => {
    const result = await pool.query(`
        SELECT
            id, resident_code, first_name, last_name, email, phone_number,
            kifle_ketema, kebele, sefer, is_active, created_at
        FROM residents
        ORDER BY created_at DESC
    `);

    return result.rows;
};

exports.updateResidentActive = async (id, isActive) => {
    const result = await pool.query(
        `
        UPDATE residents
        SET is_active = $2
        WHERE id = $1
        RETURNING id, resident_code, first_name, last_name, email, is_active
        `,
        [id, isActive]
    );

    return result.rows[0] || null;
};

exports.getAllBusinessOwners = async () => {
    const result = await pool.query(`
        SELECT
            business_id, business_code, business_name, owner_name, email, phone_number,
            kifle_ketema, kebele, is_active, created_at
        FROM business_owners
        ORDER BY created_at DESC
    `);

    return result.rows;
};

exports.updateBusinessOwnerActive = async (id, isActive) => {
    const result = await pool.query(
        `
        UPDATE business_owners
        SET is_active = $2
        WHERE business_id = $1
        RETURNING business_id, business_code, business_name, owner_name, email, is_active
        `,
        [id, isActive]
    );

    return result.rows[0] || null;
};

exports.getReports = async ({
    status = null,
    kifleKetema = null,
    search = null,
    page = 1,
    limit = 20,
}) => {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (status) {
        conditions.push(`r.status = $${paramIndex++}`);
        values.push(status);
    }

    if (kifleKetema) {
        conditions.push(
            `LOWER(COALESCE(res.kifle_ketema, col.kifle_ketema)) = LOWER($${paramIndex++})`
        );
        values.push(kifleKetema);
    }

    if (search) {
        conditions.push(`(
            r.title ILIKE $${paramIndex}
            OR r.description ILIKE $${paramIndex}
            OR res.first_name ILIKE $${paramIndex}
            OR res.last_name ILIKE $${paramIndex}
            OR res.resident_code ILIKE $${paramIndex}
            OR col.full_name ILIKE $${paramIndex}
        )`);
        values.push(`%${search}%`);
        paramIndex++;
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const baseSelect = `
        r.id,
        r.title,
        r.description,
        r.status,
        r.reporter_role,
        r.created_at,
        COALESCE(res.kifle_ketema, col.kifle_ketema) AS kifle_ketema,
        res.id AS resident_id,
        res.resident_code,
        res.first_name AS resident_first_name,
        res.last_name AS resident_last_name,
        col.id AS collector_id,
        col.full_name AS collector_name
    `;

    const fromClause = `
        FROM reports r
        LEFT JOIN residents res ON r.resident_id = res.id
        LEFT JOIN collectors col ON r.collector_id = col.id
    `;

    const countResult = await pool.query(
        `SELECT COUNT(*)::int AS total ${fromClause} ${whereClause}`,
        values
    );
    const total = countResult.rows[0].total;

    const offset = (page - 1) * limit;
    const dataQuery = `
        SELECT ${baseSelect}
        ${fromClause}
        ${whereClause}
        ORDER BY r.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;
    values.push(limit, offset);

    const dataResult = await pool.query(dataQuery, values);

    return {
        reports: dataResult.rows,
        total,
        page,
        limit,
    };
};

exports.getReportsStats = async () => {
    const [totalResult, byReporterResult, byKifleResult] = await Promise.all([
        pool.query(`
            SELECT
                (SELECT COUNT(*)::int FROM reports) AS total,
                (SELECT COUNT(*)::int FROM reports WHERE status = 'pending') AS pending,
                (SELECT COUNT(*)::int FROM reports WHERE status = 'in_progress') AS in_progress,
                (SELECT COUNT(*)::int FROM reports WHERE status = 'resolved') AS resolved
        `),
        pool.query(`
            SELECT reporter_role, COUNT(*)::int AS count
            FROM reports
            GROUP BY reporter_role
        `),
        pool.query(`
            SELECT
                COALESCE(res.kifle_ketema, col.kifle_ketema) AS kifle_ketema,
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE r.status = 'pending') AS pending,
                COUNT(*) FILTER (WHERE r.status = 'in_progress') AS in_progress,
                COUNT(*) FILTER (WHERE r.status = 'resolved') AS resolved
            FROM reports r
            LEFT JOIN residents res ON r.resident_id = res.id
            LEFT JOIN collectors col ON r.collector_id = col.id
            GROUP BY COALESCE(res.kifle_ketema, col.kifle_ketema)
            ORDER BY total DESC
        `),
    ]);

    const byReporter = {};
    byReporterResult.rows.forEach((row) => {
        byReporter[row.reporter_role] = row.count;
    });

    const byKifle = byKifleResult.rows
        .filter((row) => row.kifle_ketema)
        .map((row) => ({
            kifleKetema: row.kifle_ketema,
            total: row.total,
            pending: row.pending,
            inProgress: row.in_progress,
            resolved: row.resolved,
        }));

    return {
        total: totalResult.rows[0].total,
        pending: totalResult.rows[0].pending,
        inProgress: totalResult.rows[0].in_progress,
        resolved: totalResult.rows[0].resolved,
        byReporter,
        byKifle,
    };
};
