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

//making a login function 
exports.loginResident = async (email, password) => {
  const resident = await authRepository.findResidentByEmail(email);

  //validation
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
      email: resident.email

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
}