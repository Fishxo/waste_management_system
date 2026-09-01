const { VALID_TYPES } = require("./operationalReport.repository");

exports.generateReport = (req, res, next) => {
    const { reportType, dateFrom, dateTo } = req.body;

    if (!reportType) {
        return res.status(400).json({
            message: "Report type is required",
        });
    }

    if (!VALID_TYPES.includes(reportType)) {
        return res.status(400).json({
            message: `Invalid report type. Allowed: ${VALID_TYPES.join(", ")}`,
        });
    }

    if (dateFrom && dateTo && dateFrom > dateTo) {
        return res.status(400).json({
            message: "dateFrom must be before or equal to dateTo",
        });
    }

    next();
};

exports.listReports = (req, res, next) => {
    const { reportType, dateFrom, dateTo } = req.query;

    if (reportType && !VALID_TYPES.includes(reportType)) {
        return res.status(400).json({
            message: `Invalid report type. Allowed: ${VALID_TYPES.join(", ")}`,
        });
    }

    if (dateFrom && dateTo && dateFrom > dateTo) {
        return res.status(400).json({
            message: "dateFrom must be before or equal to dateTo",
        });
    }

    next();
};
