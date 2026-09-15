const pool = require("../../database/db");

exports.createResident = async (resident) => {
  // Reserve the next internal id so the public code (RES-XXXXXX) can be set in
  // the same insert; the column is NOT NULL with no default.
  const seqResult = await pool.query(
    `SELECT nextval(pg_get_serial_sequence('residents', 'id')) AS next_id`
  );
  const nextId = seqResult.rows[0].next_id;
  const residentCode = `RES-${String(nextId).padStart(6, "0")}`;

  const query = `
    INSERT INTO residents
    (id, first_name, last_name, email, password_hash, phone_number, kifle_ketema, kebele, sefer, resident_code)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const values = [
    nextId,
    resident.firstName,
    resident.lastName,
    resident.email,
    resident.password,
    resident.phoneNumber,
    resident.kifleKetema,
    resident.kebele,
    resident.sefer,
    residentCode
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

exports.findResidentByEmail = async (email) => {
  const query = `SELECT * FROM residents WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

exports.findResidentByPhone = async (phone) => {
  const query = `SELECT * FROM residents WHERE phone_number = $1`;
  const result = await pool.query(query, [phone]);
  return result.rows[0];
};

exports.findResidentByIdentifier = async (identifier) => {
  const { isEmail } = require("../../utils/authIdentifier");
  return isEmail(identifier)
    ? exports.findResidentByEmail(identifier)
    : exports.findResidentByPhone(identifier);
};

exports.createBusinessOwner = async (owner) => {
  // Reserve the next internal business_id so the public code (BUS-XXXXXX) can
  // be set in the same insert; the column is NOT NULL with no default.
  const seqResult = await pool.query(
    `SELECT nextval(pg_get_serial_sequence('business_owners', 'business_id')) AS next_id`
  );
  const nextId = seqResult.rows[0].next_id;
  const businessCode = `BUS-${String(nextId).padStart(6, "0")}`;

  const query = `
    INSERT INTO business_owners
    (business_id, business_name, owner_name, phone_number, email, password_hash, address, business_type, kebele, kifle_ketema, business_code)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;

  const values = [
    nextId,
    owner.businessName,
    owner.ownerName,
    owner.phoneNumber,
    owner.email,
    owner.password,
    owner.address,
    owner.businessType,
    owner.kebele,
    owner.kifleKetema,
    businessCode,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

exports.findBusinessOwnerByEmail = async (email) => {
  const query = `SELECT * FROM business_owners WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

exports.findBusinessOwnerByPhone = async (phone) => {
  const query = `SELECT * FROM business_owners WHERE phone_number = $1`;
  const result = await pool.query(query, [phone]);
  return result.rows[0];
};

exports.findBusinessOwnerByIdentifier = async (identifier) => {
  const { isEmail } = require("../../utils/authIdentifier");
  return isEmail(identifier)
    ? exports.findBusinessOwnerByEmail(identifier)
    : exports.findBusinessOwnerByPhone(identifier);
};