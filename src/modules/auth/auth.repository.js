const pool = require("../../database/db");

exports.createResident = async (resident) => {
  const query = `
    INSERT INTO residents
    (first_name,last_name, email, password_hash,phone_number,kifle_ketema,kebele,sefer)
    VALUES ($1, $2, $3,$4,$5,$6,$7,$8)
    RETURNING *
  `;

  const values = [
    resident.firstName,
    resident.lastName,
    resident.email,
    resident.password,
    resident.phoneNumber,
    resident.kifleKetema,
    resident.kebele,
    resident.sefer
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

//making a login function 
exports.findResidentByEmail = async (email) => {
  const query = `
  SELECT * FROM residents WHERE email = $1`;
  const values = [email];

  const result = await pool.query(query, values);

  return result.rows[0];
}