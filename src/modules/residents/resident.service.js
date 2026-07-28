const residentRepository = require("./resident.repository");

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