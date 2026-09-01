const operationalReportService = require("./operationalReport.service");
const { getAdminKifleKetema } = require("../../utils/adminScope");

exports.generateReport = async (req, res) => {
    try {
        const { reportType, dateFrom, dateTo } = req.body;
        const kifleKetema = getAdminKifleKetema(req);

        const report = await operationalReportService.generateReport({
            reportType,
            dateFrom: dateFrom || null,
            dateTo: dateTo || null,
            kifleKetema,
            adminId: req.user.id,
        });

        res.status(201).json({
            message: "Operational report generated successfully",
            data: report,
        });
    } catch (err) {
        if (err.message === "Invalid report type") {
            return res.status(400).json({ message: err.message });
        }

        console.log("GENERATE OPERATIONAL REPORT ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getReports = async (req, res) => {
    try {
        const { reportType, dateFrom, dateTo } = req.query;
        const kifleKetema = getAdminKifleKetema(req);

        const reports = await operationalReportService.getReports({
            reportType: reportType || null,
            dateFrom: dateFrom || null,
            dateTo: dateTo || null,
            kifleKetema,
        });

        res.status(200).json({
            message: "Operational reports retrieved successfully",
            data: reports,
        });
    } catch (err) {
        console.log("GET OPERATIONAL REPORTS ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const kifleKetema = getAdminKifleKetema(req);

        const report = await operationalReportService.getReportById(
            id,
            kifleKetema
        );

        res.status(200).json({
            message: "Operational report retrieved successfully",
            data: report,
        });
    } catch (err) {
        if (err.message === "Report not found") {
            return res.status(404).json({ message: err.message });
        }

        console.log("GET OPERATIONAL REPORT ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.downloadReport = async (req, res) => {
    try {
        const { id } = req.params;
        const kifleKetema = getAdminKifleKetema(req);

        const { filename, content } =
            await operationalReportService.downloadReportCsv(id, kifleKetema);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );
        res.status(200).send(content);
    } catch (err) {
        if (err.message === "Report not found") {
            return res.status(404).json({ message: err.message });
        }

        console.log("DOWNLOAD OPERATIONAL REPORT ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};
