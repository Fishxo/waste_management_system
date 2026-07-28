const pool = require("../../database/db");

exports.findResidentById = async (id) => {
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
            created_at
        FROM residents
        WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
};

//making an update for resident 
exports.updateResidentProfile = async (id, data) => {
    const query = `
        UPDATE residents
        SET
            first_name = $1,
            last_name = $2,
            phone_number = $3,
            kifle_ketema = $4,
            kebele = $5,
            sefer = $6
        WHERE id = $7
        RETURNING
            id,
            first_name,
            last_name,
            email,
            phone_number,
            kifle_ketema,
            kebele,
            sefer,
            created_at
    `;

    const values = [
        data.firstName,
        data.lastName,
        data.phoneNumber,
        data.kifleKetema,
        data.kebele,
        data.sefer,
        id
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};