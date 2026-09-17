const collectorService = require("./collector.service");
const { getAdminKifleKetema } = require("../../utils/adminScope");

function ensureCollector(req, res) {
    if (req.user.role !== "collector") {
        res.status(403).json({ message: "Access denied" });
        return false;
    }
    return true;
}

exports.login = async (req, res) => {
    try {
        const { identifier, email, password } = req.body;
        const loginId = identifier || email;

        const { collector, token } = await collectorService.login(
            loginId,
            password
        );

        res.status(200).json({
            message: "Login successful",
            token,
            data: collector,
        });
    } catch (err) {
        if (
            err.message === "Invalid email or password" ||
            err.message === "Your account has been deactivated" ||
            err.message === "Your account has been resigned"
        ) {
            return res.status(401).json({ message: err.message });
        }

        res.status(500).json({ message: "Server error" });
    }
};

exports.changePassword = async (req, res) => {
    try {
        if (!ensureCollector(req, res)) return;

        await collectorService.changePassword(
            req.user.id,
            req.body.currentPassword,
            req.body.newPassword
        );

        res.status(200).json({
            message: "Password changed successfully",
        });
    } catch (err) {
        if (err.message === "Collector not found") {
            return res.status(404).json({
                message: "Collector not found",
            });
        }

        if (err.message === "Current password is incorrect") {
            return res.status(400).json({
                message: "Current password is incorrect",
            });
        }

        res.status(500).json({ message: "Server error" });
    }
};

exports.getDashboard = async (req, res) => {
    try {
        if (!ensureCollector(req, res)) return;

        const dashboard = await collectorService.getDashboard(req.user.id);

        res.status(200).json({
            message: "Dashboard retrieved successfully",
            data: dashboard,
        });
    } catch (err) {
        if (err.message === "Collector not found") {
            return res.status(404).json({ message: err.message });
        }

        res.status(500).json({ message: "Server error" });
    }
};

exports.updateScheduleStatus = async (req, res) => {
    try {
        if (!ensureCollector(req, res)) return;

        const updated = await collectorService.updateScheduleStatus(
            req.user.id,
            req.params.id,
            req.body.status,
            req.body.notes
        );

        res.status(200).json({
            message: "Schedule collection status updated",
            data: updated,
        });
    } catch (err) {
        if (
            err.message.includes("not found") ||
            err.message.includes("Cannot change") ||
            err.message === "Invalid collection status" ||
            err.message === "Failed to update request status"
        ) {
            return res.status(400).json({ message: err.message });
        }

        console.error("UPDATE ON-DEMAND STATUS ERROR:", err);

        res.status(500).json({ message: "Server error" });
    }
};

exports.updateOnDemandStatus = async (req, res) => {
    try {
        if (!ensureCollector(req, res)) return;

        const updated = await collectorService.updateOnDemandStatus(
            req.user.id,
            req.params.id,
            req.body.status,
            req.body.notes
        );

        res.status(200).json({
            message: "On-demand collection status updated",
            data: updated,
        });
    } catch (err) {
        if (
            err.message.includes("not found") ||
            err.message.includes("Cannot change")
        ) {
            return res.status(400).json({ message: err.message });
        }

        res.status(500).json({ message: "Server error" });
    }
};

exports.createCollector = async (req, res) => {
    try {
        const kifleKetema = getAdminKifleKetema(req);
        const body = { ...req.body };

        if (kifleKetema) {
            body.kifleKetema = kifleKetema;
        }

        const collector = await collectorService.createCollector(
            req.user.id,
            body
        );

        res.status(201).json({
            message: "Collector created successfully",
            data: collector,
        });
    } catch (err) {
        if (err.code === "23505") {
            const field = err.detail?.includes("phone_number")
                ? "Phone number"
                : "Email";
            return res.status(409).json({
                message: `${field} already exists`,
            });
        }

        res.status(500).json({ message: "Server error" });
    }
};

exports.getAllCollectors = async (req, res) => {
    try {
        const kifleKetema = getAdminKifleKetema(req);
        const collectors = await collectorService.getAllCollectors(kifleKetema);

        res.status(200).json({
            message: "Collectors retrieved successfully",
            data: collectors,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateCollectorStatus = async (req, res) => {
    try {
        const kifleKetema = getAdminKifleKetema(req);
        const collector = await collectorService.updateCollectorStatus(
            kifleKetema,
            req.params.id,
            req.body.status,
            req.body.reason
        );

        res.status(200).json({
            message: "Collector status updated successfully",
            data: collector,
        });
    } catch (err) {
        if (err.message === "Collector not found") {
            return res.status(404).json({ message: err.message });
        }

        if (err.message === "Invalid collector status") {
            return res.status(400).json({ message: err.message });
        }

        res.status(500).json({ message: "Server error" });
    }
};

exports.updateCollectorProfile = async (req, res) => {
    try {
        const kifleKetema = getAdminKifleKetema(req);
        const collector = await collectorService.updateCollectorProfile(
            kifleKetema,
            req.params.id,
            req.body
        );

        res.status(200).json({
            message: "Collector updated successfully",
            data: collector,
        });
    } catch (err) {
        if (err.code === "23505") {
            const field = err.detail?.includes("phone_number")
                ? "Phone number"
                : "Email";
            return res.status(409).json({
                message: `${field} already exists`,
            });
        }

        if (err.message === "Collector not found") {
            return res.status(404).json({ message: err.message });
        }

        res.status(500).json({ message: "Server error" });
    }
};

exports.assignCollectorToSchedule = async (req, res) => {
    try {
        const schedule = await collectorService.assignCollectorToSchedule(
            req.params.id,
            req.body.collectorId
        );

        res.status(200).json({
            message: "Collector assigned to schedule",
            data: schedule,
        });
    } catch (err) {
        if (err.message === "Collector not found") {
            return res.status(404).json({ message: err.message });
        }
        if (err.message === "Schedule not found") {
            return res.status(404).json({ message: err.message });
        }

        res.status(500).json({ message: "Server error" });
    }
};

exports.assignCollectorToRequest = async (req, res) => {
    try {
        const request = await collectorService.assignCollectorToRequest(
            req.params.id,
            req.body.collectorId
        );

        res.status(200).json({
            message: "Collector assigned to request",
            data: request,
        });
    } catch (err) {
        if (err.message === "Collector not found") {
            return res.status(404).json({ message: err.message });
        }
        if (err.message === "Pending or approved request not found") {
            return res.status(404).json({ message: err.message });
        }
        if (err.message === "Collector is already assigned to another active request") {
            return res.status(409).json({ message: err.message });
        }

        res.status(500).json({ message: "Server error" });
    }
};
