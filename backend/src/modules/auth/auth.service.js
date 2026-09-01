//making encyption for password 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authRepository = require("./auth.repository");

exports.registerResident = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const residentData = {
    ...data,
    password: hashedPassword,
  };

  return await authRepository.createResident(residentData);
};

const { normalizeIdentifier } = require("../../utils/authIdentifier");

exports.loginResident = async (identifier, password) => {
  const resident = await authRepository.findResidentByIdentifier(
    normalizeIdentifier(identifier)
  );

  if (!resident) {
    throw new Error("Invalid email or password");
  }
  const isPasswordCorrect = await bcrypt.compare(
    password,
    resident.password_hash
  );
  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password");
  }
  //making function a jwt 
  const token = jwt.sign(
    {
      id: resident.id,
      email: resident.email,
      role: "resident",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );
  return {
    resident,
    token
  };
};

exports.registerBusinessOwner = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const ownerData = {
    ...data,
    password: hashedPassword,
  };

  return await authRepository.createBusinessOwner(ownerData);
};

exports.loginBusinessOwner = async (identifier, password) => {
  const owner = await authRepository.findBusinessOwnerByIdentifier(
    normalizeIdentifier(identifier)
  );

  if (!owner) {
    throw new Error("Invalid email or password");
  }

  if (owner.is_active === false) {
    throw new Error("Your account has been deactivated");
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    owner.password_hash
  );

  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      id: owner.business_id,
      email: owner.email,
      role: "business_owner",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return {
    owner,
    token,
  };
};