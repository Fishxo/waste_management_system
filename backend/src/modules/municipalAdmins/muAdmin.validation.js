exports.login = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required",
        });
    }

    next();
};

//validat for update reports 
exports.updateReportStatus = (req, res, next) => {
    const { status } = req.body;

    const allowedStatuses = [
        "pending",
        "in_progress",
        "resolved",
    ];

    if (!status) {
        return res.status(400).json({
            message: "Status is required",
        });
    }

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid status. Allowed values are: pending, in_progress, resolved",
        });
    }

    next();
};