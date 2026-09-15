const pool = require("../../database/db");

exports.findBusinessOwnerById = async (id) => {
    const query = `
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
            created_at
        FROM business_owners
        WHERE business_id = $1
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
};

exports.findBusinessOwnerPasswordById = async (id) => {
    const query = `
        SELECT password_hash
        FROM business_owners
        WHERE business_id = $1
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0] || null;
};

exports.updateBusinessOwnerPassword = async (id, passwordHash) => {
    const query = `
        UPDATE business_owners
        SET password_hash = $1
        WHERE business_id = $2
    `;

    await pool.query(query, [passwordHash, id]);
};

exports.updateBusinessOwnerProfile = async (id, data) => {
    const query = `
        UPDATE business_owners
        SET
            business_name = $1,
            owner_name = $2,
            phone_number = $3,
            address = $4,
            business_type = $5,
            kebele = $6,
            kifle_ketema = $7
        WHERE business_id = $8
        RETURNING
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
            created_at
    `;

    const values = [
        data.businessName,
        data.ownerName,
        data.phoneNumber,
        data.address,
        data.businessType,
        data.kebele,
        data.kifleKetema,
        id,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};
