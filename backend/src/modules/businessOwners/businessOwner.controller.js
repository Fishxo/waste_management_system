const businessOwnerService = require("./businessOwner.service");
const scheduleService = require("../schedules/schedule.service");
const scheduleIssueService = require("../scheduleIssues/scheduleIssue.service");

function ensureBusinessOwner(req, res) {
    if (req.user.role !== "business_owner") {
        res.status(403).json({ message: "Access denied" });
        return false;
    }
    return true;
}

exports.getBusinessOwnerProfile = async (req, res) => {
    try {
        if (!ensureBusinessOwner(req, res)) return;

        const owner = await businessOwnerService.getBusinessOwnerProfile(
            req.user.id
        );

        res.status(200).json({
            message: "Business owner profile retrieved successfully",
            data: owner,
        });
    } catch (err) {
        if (err.message === "Business owner not found") {
            return res.status(404).json({
                message: "Business owner not found",
            });
        }

        res.status(500).json({
            message: "Server error",
        });
    }
};

exports.updateBusinessOwnerProfile = async (req, res) => {
    try {
        if (!ensureBusinessOwner(req, res)) return;

        const owner = await businessOwnerService.updateBusinessOwnerProfile(
            req.user.id,
            req.body
        );

        res.status(200).json({
            message: "Business owner profile updated successfully",
            data: owner,
        });
    } catch (err) {
        if (err.message === "Business owner not found") {
            return res.status(404).json({
                message: "Business owner not found",
            });
        }

        if (err.code === "23505") {
            const field = err.detail?.includes("phone_number")
                ? "Phone number"
                : "Email";
            return res.status(409).json({
                message: `${field} already exists`,
            });
        }

        res.status(500).json({
            message: "Server error",
        });
    }
};

exports.changeBusinessOwnerPassword = async (req, res) => {
    try {
        if (!ensureBusinessOwner(req, res)) return;

        await businessOwnerService.changeBusinessOwnerPassword(
            req.user.id,
            req.body.currentPassword,
            req.body.newPassword
        );

        res.status(200).json({
            message: "Password changed successfully",
        });
    } catch (err) {
        if (err.message === "Business owner not found") {
            return res.status(404).json({
                message: "Business owner not found",
            });
        }

        if (err.message === "Current password is incorrect") {
            return res.status(400).json({
                message: "Current password is incorrect",
            });
        }

        res.status(500).json({
            message: "Server error",
        });
    }
};

exports.getBusinessOwnerSchedules = async (req, res) => {
    try {
        if (!ensureBusinessOwner(req, res)) return;

        const owner = await businessOwnerService.getBusinessOwnerProfile(
            req.user.id
        );

        const schedules = await scheduleService.getSchedulesForBusinessOwner(
            owner.kifle_ketema,
            owner.kebele
        );

        res.status(200).json({
            message: "Schedules retrieved successfully",
            data: schedules,
        });
    } catch (err) {
        if (err.message === "Business owner not found") {
            return res.status(404).json({
                message: "Business owner not found",
            });
        }

        console.log("GET BUSINESS OWNER SCHEDULES ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

exports.getBusinessOwnerScheduleIssues = async (req, res) => {
    try {
        if (!ensureBusinessOwner(req, res)) return;

        const issues = await scheduleIssueService.getIssuesByBusinessOwner(req.user.id);
        res.status(200).json({
            message: "Schedule issues retrieved successfully",
            data: issues,
        });
    } catch (err) {
        console.log("GET BUSINESS OWNER SCHEDULE ISSUES ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};
