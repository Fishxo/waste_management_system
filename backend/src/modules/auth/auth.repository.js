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
  const query = `
    INSERT INTO business_owners
    (business_name, owner_name, phone_number, email, password_hash, address, business_type, kebele, kifle_ketema)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const values = [
    owner.businessName,
    owner.ownerName,
    owner.phoneNumber,
    owner.email,
    owner.password,
    owner.address,
    owner.businessType,
    owner.kebele,
    owner.kifleKetema,
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