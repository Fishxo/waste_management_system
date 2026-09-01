const bcrypt = require("bcryptjs");
const businessOwnerRepository = require("./businessOwner.repository");

exports.getBusinessOwnerProfile = async (id) => {
    const owner = await businessOwnerRepository.findBusinessOwnerById(id);

    if (!owner) {
        throw new Error("Business owner not found");
    }

    return owner;
};

exports.updateBusinessOwnerProfile = async (id, data) => {
    const owner = await businessOwnerRepository.updateBusinessOwnerProfile(
        id,
        data
    );

    if (!owner) {
        throw new Error("Business owner not found");
    }

    return owner;
};

exports.changeBusinessOwnerPassword = async (
    id,
    currentPassword,
    newPassword
) => {
    const owner =
        await businessOwnerRepository.findBusinessOwnerPasswordById(id);

    if (!owner) {
        throw new Error("Business owner not found");
    }

    const isMatch = await bcrypt.compare(
        currentPassword,
        owner.password_hash
    );

    if (!isMatch) {
        throw new Error("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await businessOwnerRepository.updateBusinessOwnerPassword(
        id,
        hashedPassword
    );
};
