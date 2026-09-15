const pool = require("../../database/db");

exports.createFeedback = async ({ submitterRole, submitterId, rating, comment }) => {
    const query = `
        INSERT INTO feedback (submitter_role, submitter_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;

    const result = await pool.query(query, [
        submitterRole,
        submitterId,
        rating,
        comment || null,
    ]);

    return result.rows[0];
};

exports.getFeedbackBySubmitter = async (submitterRole, submitterId) => {
    const query = `
        SELECT id, submitter_role, submitter_id, rating, comment, created_at
        FROM feedback
        WHERE submitter_role = $1 AND submitter_id = $2
        ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [submitterRole, submitterId]);

    return result.rows;
};

exports.getAllFeedback = async (kifleKetema) => {
    let query = `
        SELECT
            f.id,
            f.submitter_role,
            f.submitter_id,
            f.rating,
            f.comment,
            f.created_at,
            CASE
                WHEN f.submitter_role = 'resident' THEN
                    CONCAT(r.first_name, ' ', r.last_name)
                WHEN f.submitter_role = 'business_owner' THEN
                    b.owner_name
            END AS submitter_name,
            CASE
                WHEN f.submitter_role = 'resident' THEN r.email
                WHEN f.submitter_role = 'business_owner' THEN b.email
            END AS submitter_email,
            CASE
                WHEN f.submitter_role = 'resident' THEN r.resident_code
                WHEN f.submitter_role = 'business_owner' THEN b.business_code
            END AS submitter_code,
            CASE
                WHEN f.submitter_role = 'resident' THEN r.kifle_ketema
                WHEN f.submitter_role = 'business_owner' THEN b.kifle_ketema
            END AS kifle_ketema
        FROM feedback f
        LEFT JOIN residents r
            ON f.submitter_role = 'resident' AND f.submitter_id = r.id
        LEFT JOIN business_owners b
            ON f.submitter_role = 'business_owner' AND f.submitter_id = b.business_id
    `;

    const values = [];

    if (kifleKetema) {
        query += `
        WHERE (
            (f.submitter_role = 'resident' AND r.kifle_ketema = $1)
            OR (f.submitter_role = 'business_owner' AND b.kifle_ketema = $1)
        )`;
        values.push(kifleKetema);
    }

    query += ` ORDER BY f.created_at DESC`;

    const result = await pool.query(query, values);

    return result.rows;
};
