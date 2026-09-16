const reportService = require("./report.service");

exports.createReport = async (req, res) => {
    try {
        const report = await reportService.createReport(
            req.user,
            req.body
        );

        res.status(201).json({
            message: "Report created successfully",
            data: report,
        });

    } catch (err) {
        if (err.message === "Your account has been deactivated") {
            return res.status(403).json({
                message: err.message,
            });
        }

        if (err.message === "Resident not found" || err.message === "Collector not found") {
            return res.status(404).json({
                message: err.message,
            });
        }

        if (err.message === "You have reached the maximum of 3 reports per day.") {
            return res.status(400).json({
                message: err.message,
            });
        }

        console.log("CREATE REPORT ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

//getting the daily report limit usage for the resident or collector
exports.getDailyCount = async (req, res) => {
    try {
        const count = await reportService.getDailyReportCount(req.user);

        res.status(200).json({
            message: "Daily report count retrieved successfully",
            data: count,
        });

    } catch (err) {
        console.log("GET DAILY COUNT ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

//getting the reports back to the user 
exports.getMyReports = async (req, res) => {
    try {
        const reports = await reportService.getMyReports(req.user);

        res.status(200).json({
            message: "Reports retrieved successfully",
            data: reports,
        });

    } catch (err) {
        console.log("GET REPORTS ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

//getting the report by report id 
exports.getReportById = async (req, res) => {
    try {
        const report = await reportService.getReportById(
            req.params.id,
            req.user
        );

        res.status(200).json({
            message: "Report retrieved successfully",
            data: report,
        });

    } catch (err) {
        if (err.message === "Report not found") {
            return res.status(404).json({
                message: "Report not found",
            });
        }

        console.log("GET REPORT ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

//getting the report history
exports.getReportHistory = async (req, res) => {

    try {

        const { id } = req.params;

        const user = req.user;

        const history = await reportService.getReportHistory(
            id,
            user
        );

        res.status(200).json({
            message: "Report history retrieved successfully",
            data: history,
        });


    } catch (err) {

        if (err.message === "Report not found") {
            return res.status(404).json({
                message: "Report not found",
            });
        }


        console.log("GET REPORT HISTORY ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

//for making update from the user side 
exports.updateReport = async (req, res, next) => {
    try {
        const reportId = req.params.id;

        const updatedReport = await reportService.updateReport(
            reportId,
            req.body,
            req.user
        );
        res.status(200).json({
            message: "report update successfully",
            data: updatedReport
        })
    } catch (err) {
            //validation
        if (err.message === "report not found") {
            return res.status(403).json({
                message: err.message,
            });
        }

        if (err.message === "resident is not found" || err.message === "collector is not found") {
            return res.status(403).json({
                message: err.message,
            });
        }

        if (err.message === "report in progress state can not be edit") {
            return res.status(403).json({
                message: err.message,
            });
        }

        if (err.message === "your account has been deactivated, you can not make update") {
            return res.status(403).json({
                message: err.message,
            })
        }
        next(err);
    }
};

//making delete the report from the user side 
exports.deleteReport = async (req, res, next) => {
    try {
        const reportId = req.params.id;

        const report = await reportService.deleteReport(
            reportId,
            req.user
        );

        res.status(200).json({
            message: "Report deleted successfully",
            data: report
        });

    } catch (err) {
        if (err.message === "Report not found") {
            return res.status(404).json({
                message: err.message,
            });
        }

        if (err.message === "You cannot delete this report") {
            return res.status(403).json({
                message: err.message,
            });
        }

        if (err.message === "You cannot delete a processed report") {
            return res.status(403).json({
                message: err.message,
            });
        }

        console.log("DELETE REPORT ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};