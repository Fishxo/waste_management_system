const ALLOWED_ISSUE_STATUSES = ["pending", "reviewing", "resolved"];

exports.createIssue = (req, res, next) => {
    const { scheduleId } = req.params;
    const { description } = req.body;

    if (!scheduleId || Number.isNaN(Number(scheduleId))) {
        return res.status(400).json({
            message: "A valid schedule ID is required",
        });
    }

    if (!description || !String(description).trim()) {
        return res.status(400).json({
            message: "Description is required",
        });
    }

    next();
};

exports.updateStatus = (req, res, next) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            message: "Status is required",
        });
    }

    if (!ALLOWED_ISSUE_STATUSES.includes(status)) {
        return res.status(400).json({
            message: "Invalid status. Allowed values are: pending, reviewing, resolved",
        });
    }

    next();
};

exports.listIssues = (req, res, next) => {
    const { status, type } = req.query;

    if (status && !ALLOWED_ISSUE_STATUSES.includes(status)) {
        return res.status(400).json({
            message: "Invalid status. Allowed values are: pending, reviewing, resolved",
        });
    }

    if (type && !['resident', 'business'].includes(type)) {
        return res.status(400).json({
            message: "Invalid type. Allowed values are: resident, business",
        });
    }

    next();
};
