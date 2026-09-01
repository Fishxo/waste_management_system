const feedbackService = require("./feedback.service");
const { getAdminKifleKetema } = require("../../utils/adminScope");

const ALLOWED_ROLES = ["resident", "business_owner"];

function ensureSubmitter(req, res) {
    if (!ALLOWED_ROLES.includes(req.user.role)) {
        res.status(403).json({ message: "Access denied" });
        return false;
    }
    return true;
}

exports.createFeedback = async (req, res) => {
    try {
        if (!ensureSubmitter(req, res)) return;

        const feedback = await feedbackService.createFeedback(
            req.user.role,
            req.user.id,
            req.body
        );

        res.status(201).json({
            message: "Feedback submitted successfully",
            data: feedback,
        });
    } catch (err) {
        if (err.message === "Access denied") {
            return res.status(403).json({ message: err.message });
        }

        res.status(500).json({ message: "Server error" });
    }
};

exports.getMyFeedback = async (req, res) => {
    try {
        if (!ensureSubmitter(req, res)) return;

        const feedback = await feedbackService.getMyFeedback(
            req.user.role,
            req.user.id
        );

        res.status(200).json({
            message: "Feedback retrieved successfully",
            data: feedback,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAllFeedback = async (req, res) => {
    try {
        const kifleKetema = getAdminKifleKetema(req);
        const feedback = await feedbackService.getAllFeedback(kifleKetema);

        res.status(200).json({
            message: "Feedback retrieved successfully",
            data: feedback,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
