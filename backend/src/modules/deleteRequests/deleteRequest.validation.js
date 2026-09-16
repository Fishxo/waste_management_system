exports.requestDeletion = (req, res, next) => {
    const { requestType, reason } = req.body;

    if (!["notifications", "reports", "all"].includes(requestType)) {
        return res.status(400).json({
            message: "requestType must be notifications, reports or all",
        });
    }

    if (reason !== undefined && reason !== null) {
        if (typeof reason !== "string" || reason.trim().length > 500) {
            return res.status(400).json({
                message: "Reason should not exceed 500 characters",
            });
        }
    }

    next();
};

exports.decideRequest = (req, res, next) => {
    const { status } = req.body;

    if (!["approved", "denied"].includes(status)) {
        return res.status(400).json({
            message: "Status must be approved or denied",
        });
    }

    next();
};