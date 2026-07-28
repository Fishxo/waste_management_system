const residentService = require("./resident.service");

exports.getResidentProfile = async (req, res) => {
    try {
        const resident = await residentService.getResidentProfile(
            req.user.id
        );

        res.status(200).json({
            message: "Resident profile retrieved successfully",
            data: resident,
        });

    } catch (err) {
        if (err.message === "Resident not found") {
            return res.status(404).json({
                message: "Resident not found",
            });
        }

        res.status(500).json({
            message: "Server error",
        });
    }
};

//getting an update resident profile requiest 
exports.updateResidentProfile = async (req, res) => {
    try {
        const resident = await residentService.updateResidentProfile(
            req.user.id,
            req.body
        );

        res.status(200).json({
            message: "Resident profile updated successfully",
            data: resident,
        });

    } catch (err) {
        if (err.message === "Resident not found") {
            return res.status(404).json({
                message: "Resident not found",
            });
        }

        res.status(500).json({
            message: "Server error",
        });
    }
};
