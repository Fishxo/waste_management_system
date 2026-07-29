const adminService = require("./muAdmin.service");

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await adminService.login(
            email,
            password
        );

        res.status(200).json({
            message: "Admin login successful",
            data: admin,
        });

    } catch (err) {
        if (err.message === "Invalid email or password") {
            return res.status(401).json({
                message: err.message,
            });
        }

        console.log("ADMIN LOGIN ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

//making an update report
exports.updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const report = await adminService.updateReportStatus(
            id,
            status
        );

        res.status(200).json({
            message: "Report status updated successfully",
            data: report,
        });

    } catch (err) {
        if (err.message === "Report not found") {
            return res.status(404).json({
                message: "Report not found",
            });
        }

        console.log("UPDATE REPORT STATUS ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};