const activityLogService = require("./activityLog.service");

exports.getActivityLogs = async (req, res) => {
    try {
        const {
            actorRole,
            actorName,
            action,
            search,
            page = 1,
            limit = 20,
        } = req.query;

        const safePage = Math.max(parseInt(page, 10) || 1, 1);
        const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

        const result = await activityLogService.getActivityLogs({
            actorRole: actorRole || null,
            actorName: actorName || null,
            action: action || null,
            search: search || null,
            page: safePage,
            limit: safeLimit,
        });

        res.status(200).json({
            message: "Activity logs retrieved successfully",
            data: result,
        });
    } catch (err) {
        console.error("GET ACTIVITY LOGS ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getActivityStats = async (req, res) => {
    try {
        const stats = await activityLogService.getActivityStats();

        res.status(200).json({
            message: "Activity statistics retrieved successfully",
            data: stats,
        });
    } catch (err) {
        console.error("GET ACTIVITY STATS ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};