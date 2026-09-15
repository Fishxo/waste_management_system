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
        SELECT id, username, email, kifle_ketema, created_at
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
        RETURNING id, username, email, kifle_ketema, created_at
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
            RETURNING id, username, email, kifle_ketema, created_at
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
        RETURNING id, username, email, kifle_ketema, created_at
        `,
        [id, username, email, kifleKetema || null]
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
        SET is_active = $2
        WHERE id = $1
        RETURNING id, full_name, email, is_active
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
