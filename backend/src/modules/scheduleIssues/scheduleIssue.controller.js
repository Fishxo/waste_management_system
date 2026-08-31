const scheduleIssueService = require("./scheduleIssue.service");

exports.createIssue = async (req, res) => {
    try {
        if (req.user.role !== "resident") {
            return res.status(403).json({
                message: "Access denied",
            });
        }

        const residentId = req.user.id;
        const { scheduleId } = req.params;
        const { description } = req.body;

        const issue = await scheduleIssueService.createIssue(
            residentId,
            scheduleId,
            description
        );

        res.status(201).json({
            message: "Schedule issue submitted successfully",
            data: issue,
        });
    } catch (err) {
        if (err.message === "Resident not found") {
            return res.status(404).json({
                message: err.message,
            });
        }

        if (err.message === "Schedule not found") {
            return res.status(404).json({
                message: err.message,
            });
        }

        if (err.message === "You can only raise issues for schedules in your area") {
            return res.status(403).json({
                message: err.message,
            });
        }

        if (err.message === "An active issue already exists for this schedule") {
            return res.status(409).json({
                message: err.message,
            });
        }

        console.log("CREATE SCHEDULE ISSUE ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

exports.getAllIssues = async (req, res) => {
    try {
        const { status } = req.query;

        const issues = await scheduleIssueService.getAllIssues(status);

        res.status(200).json({
            message: "Schedule issues retrieved successfully",
            data: issues,
        });
    } catch (err) {
        console.log("GET SCHEDULE ISSUES ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

exports.updateIssueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const issue = await scheduleIssueService.updateIssueStatus(id, status);

        res.status(200).json({
            message: "Schedule issue status updated successfully",
            data: issue,
        });
    } catch (err) {
        if (err.message === "Issue not found") {
            return res.status(404).json({
                message: err.message,
            });
        }

        console.log("UPDATE SCHEDULE ISSUE STATUS ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};
