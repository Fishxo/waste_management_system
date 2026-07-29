const reportService = require("./report.service");

exports.createReport = async (req, res) => {
    try {
        const report = await reportService.createReport(
            req.user.id,
            req.body
        );

        res.status(201).json({
            message: "Report created successfully",
            data: report,
        });

    } catch (err) {
        console.log("CREATE REPORT ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

//getting the reports back to the user 
exports.getMyReports = async (req, res) => {
    try {
        const reports = await reportService.getReportsByResidentId(
            req.user.id
        );

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
            req.user.id
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