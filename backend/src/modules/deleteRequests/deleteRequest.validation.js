exports.requestDeletion = (req, res, next) => {
    const { requestType, notificationType, reason } = req.body;

    if (!["notifications", "reports", "all"].includes(requestType)) {
        return res.status(400).json({
            message: "requestType must be notifications, reports or all",
        });
    }

    const allowedNotificationTypes = [
        "schedule_update",
        "request_approved",
        "collector_assigned",
        "collection_completed",
    ];
    if (notificationType && !allowedNotificationTypes.includes(notificationType)) {
        return res.status(400).json({ message: "Invalid notification type" });
    }
    if (notificationType && requestType === "reports") {
        return res.status(400).json({
            message: "Notification type can only be used for notification deletion",
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