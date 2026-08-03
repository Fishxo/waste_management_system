const residentRepository = require("./resident.repository");
const bcrypt = require("bcryptjs");

exports.getResidentProfile = async (id) => {
    const resident = await residentRepository.findResidentById(id);

    if (!resident) {
        throw new Error("Resident not found");
    }

    return resident;
};

//update logic for resident 

exports.updateResidentProfile = async (id, data) => {
    const resident = await residentRepository.updateResidentProfile(id, data);

    if (!resident) {
        throw new Error("Resident not found");
    }

    return resident;
};

exports.changeResidentPassword = async (id, currentPassword, newPassword) => {
    const resident = await residentRepository.findResidentPasswordById(id);

    if (!resident) {
        throw new Error("Resident not found");
    }

    const isMatch = await bcrypt.compare(
        currentPassword,
        resident.password_hash
    );

    if (!isMatch) {
        throw new Error("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await residentRepository.updateResidentPassword(id, hashedPassword);
};