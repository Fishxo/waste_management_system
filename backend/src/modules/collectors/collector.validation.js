exports.login = (req, res, next) => {
    const { identifier, email, password } = req.body;

    if ((!identifier && !email) || !password) {
        return res.status(400).json({
            message: "Phone/email and password are required",
        });
    }

    next();
};

exports.createCollector = (req, res, next) => {
    const { fullName, phoneNumber, email, password, kifleKetema } = req.body;

    if (!fullName || !phoneNumber || !email || !password || !kifleKetema) {
        return res.status(400).json({
            message: "All fields are required",
        });
    }

    if (fullName.length < 3) {
        return res.status(400).json({
            message: "Full name should be at least 3 characters",
        });
    }

    if (!/^(09|07)\d{8}$/.test(phoneNumber)) {
        return res.status(400).json({
            message:
                "Phone number should be 10 characters and start with 09 or 07",
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "Password should be at least 6 characters",
        });
    }

    next();
};

exports.changePassword = (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            message: "Current password and new password are required",
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            message: "New password should be at least 6 characters",
        });
    }

    next();
};

exports.updateCollectionStatus = (req, res, next) => {
    const { status, notes } = req.body;

    if (!status) {
        return res.status(400).json({
            message: "Status is required",
        });
    }

    if (!["pending", "in_progress", "completed", "failed"].includes(status)) {
        return res.status(400).json({
            message: "Invalid status. Allowed: pending, in_progress, completed, failed",
        });
    }

    if (status === "failed" && (!notes || !String(notes).trim())) {
        return res.status(400).json({
            message: "A failure reason is required when marking as failed",
        });
    }

    if (notes && String(notes).length > 500) {
        return res.status(400).json({
            message: "Notes must be 500 characters or less",
        });
    }

    next();
};

exports.assignCollector = (req, res, next) => {
    const { collectorId } = req.body;

    if (!collectorId) {
        return res.status(400).json({
            message: "Collector ID is required",
        });
    }

    next();
};
