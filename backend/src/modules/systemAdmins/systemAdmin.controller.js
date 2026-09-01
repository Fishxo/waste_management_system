const fs = require("fs");
const systemAdminService = require("./systemAdmin.service");

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await systemAdminService.login(email, password);

        res.status(200).json({
            message: "System admin login successful",
            data: admin,
        });
    } catch (err) {
        if (
            err.message === "Invalid email or password" ||
            err.message === "Your account has been deactivated"
        ) {
            return res.status(401).json({ message: err.message });
        }

        console.log("SYSTEM ADMIN LOGIN ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await systemAdminService.getDashboardStats();

        res.status(200).json({
            message: "Dashboard statistics retrieved successfully",
            data: stats,
        });
    } catch (err) {
        console.log("SYSTEM ADMIN DASHBOARD ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getMunicipalAdmins = async (req, res) => {
    try {
        const admins = await systemAdminService.getMunicipalAdmins();

        res.status(200).json({
            message: "Municipal admins retrieved successfully",
            data: admins,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.createMunicipalAdmin = async (req, res) => {
    try {
        const admin = await systemAdminService.createMunicipalAdmin(req.body);

        res.status(201).json({
            message: "Municipal admin created successfully",
            data: admin,
        });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({
                message: "Username or email already exists",
            });
        }

        res.status(500).json({ message: "Server error" });
    }
};

exports.getCollectors = async (req, res) => {
    try {
        const collectors = await systemAdminService.getCollectors();

        res.status(200).json({
            message: "Collectors retrieved successfully",
            data: collectors,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.createCollector = async (req, res) => {
    try {
        const collector = await systemAdminService.createCollector(req.body);

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

exports.activateCollector = async (req, res) => {
    try {
        const collector = await systemAdminService.setCollectorActive(
            req.params.id,
            true
        );

        res.status(200).json({
            message: "Collector activated successfully",
            data: collector,
        });
    } catch (err) {
        if (err.message === "Collector not found") {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: "Server error" });
    }
};

exports.deactivateCollector = async (req, res) => {
    try {
        const collector = await systemAdminService.setCollectorActive(
            req.params.id,
            false
        );

        res.status(200).json({
            message: "Collector deactivated successfully",
            data: collector,
        });
    } catch (err) {
        if (err.message === "Collector not found") {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: "Server error" });
    }
};

exports.getResidents = async (req, res) => {
    try {
        const residents = await systemAdminService.getResidents();

        res.status(200).json({
            message: "Residents retrieved successfully",
            data: residents,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.activateResident = async (req, res) => {
    try {
        const resident = await systemAdminService.setResidentActive(
            req.params.id,
            true
        );

        res.status(200).json({
            message: "Resident activated successfully",
            data: resident,
        });
    } catch (err) {
        if (err.message === "Resident not found") {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: "Server error" });
    }
};

exports.deactivateResident = async (req, res) => {
    try {
        const resident = await systemAdminService.setResidentActive(
            req.params.id,
            false
        );

        res.status(200).json({
            message: "Resident deactivated successfully",
            data: resident,
        });
    } catch (err) {
        if (err.message === "Resident not found") {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: "Server error" });
    }
};

exports.getBusinessOwners = async (req, res) => {
    try {
        const owners = await systemAdminService.getBusinessOwners();

        res.status(200).json({
            message: "Business owners retrieved successfully",
            data: owners,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.activateBusinessOwner = async (req, res) => {
    try {
        const owner = await systemAdminService.setBusinessOwnerActive(
            req.params.id,
            true
        );

        res.status(200).json({
            message: "Business owner activated successfully",
            data: owner,
        });
    } catch (err) {
        if (err.message === "Business owner not found") {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: "Server error" });
    }
};

exports.deactivateBusinessOwner = async (req, res) => {
    try {
        const owner = await systemAdminService.setBusinessOwnerActive(
            req.params.id,
            false
        );

        res.status(200).json({
            message: "Business owner deactivated successfully",
            data: owner,
        });
    } catch (err) {
        if (err.message === "Business owner not found") {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: "Server error" });
    }
};

exports.createBackup = async (req, res) => {
    try {
        const backup = await systemAdminService.createBackup(req.user.id);

        res.status(201).json({
            message: "Database backup created successfully",
            data: backup,
        });
    } catch (err) {
        console.log("CREATE BACKUP ERROR:", err);
        res.status(500).json({
            message: err.message || "Failed to create backup",
        });
    }
};

exports.listBackups = async (req, res) => {
    try {
        const backups = await systemAdminService.listBackups();

        res.status(200).json({
            message: "Backups retrieved successfully",
            data: backups,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.downloadBackup = async (req, res) => {
    try {
        const backup = await systemAdminService.downloadBackup(req.params.id);

        if (!fs.existsSync(backup.file_path)) {
            return res.status(404).json({ message: "Backup file not found" });
        }

        res.download(backup.file_path, backup.filename);
    } catch (err) {
        if (err.message === "Backup not found") {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: "Server error" });
    }
};

exports.restoreDatabase = async (req, res) => {
    try {
        const { sql } = req.body;

        await systemAdminService.restoreDatabase(sql, req.user.id);

        res.status(200).json({
            message: "Database restored successfully. A pre-restore backup was created.",
        });
    } catch (err) {
        console.log("RESTORE DATABASE ERROR:", err);
        res.status(500).json({
            message: err.message || "Failed to restore database",
        });
    }
};
