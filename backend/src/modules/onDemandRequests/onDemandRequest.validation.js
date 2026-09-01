function isValidCoordinate(lat, lng) {
    const latitude = Number(lat);
    const longitude = Number(lng);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return false;
    }

    return (
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
}

exports.createRequest = (req, res, next) => {
    const { latitude, longitude, description } = req.body;

    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
            message: "Latitude and longitude are required",
        });
    }

    if (!isValidCoordinate(latitude, longitude)) {
        return res.status(400).json({
            message: "Invalid latitude or longitude",
        });
    }

    if (description && String(description).length > 1000) {
        return res.status(400).json({
            message: "Description must be 1000 characters or less",
        });
    }

    next();
};

exports.listRequests = (req, res, next) => {
    const { status } = req.query;

    if (status && !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({
            message: "Invalid status filter",
        });
    }

    next();
};

exports.updateStatus = (req, res, next) => {
    const { status, adminNotes } = req.body;

    if (!status) {
        return res.status(400).json({
            message: "Status is required",
        });
    }

    if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({
            message: "Status must be approved or rejected",
        });
    }

    if (adminNotes && String(adminNotes).length > 500) {
        return res.status(400).json({
            message: "Admin notes must be 500 characters or less",
        });
    }

    next();
};
