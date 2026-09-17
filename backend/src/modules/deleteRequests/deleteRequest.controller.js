const deleteRequestService = require("./deleteRequest.service");
const { getAdminKifleKetema } = require("../../utils/adminScope");

exports.requestDeletion = async (req, res) => {
    try {
        const { requestType, notificationType, reason } = req.body;
        const kifleKetema = getAdminKifleKetema(req);

        if (!kifleKetema) {
            return res.status(400).json({ message: "Kifle ketema not found for this admin" });
        }

        const data = await deleteRequestService.requestDeletion(
            req.user.id,
            kifleKetema,
            requestType,
            notificationType,
            reason
        );

        res.status(201).json({
            message: "Deletion request submitted for system admin approval",
            data,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        const data = await deleteRequestService.getMyRequests(req.user.id);

        res.status(200).json({
            message: "Delete requests retrieved successfully",
            data,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAllRequests = async (req, res) => {
    try {
        const data = await deleteRequestService.getAllRequests();

        res.status(200).json({
            message: "Delete requests retrieved successfully",
            data,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.decideRequest = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["approved", "denied"].includes(status)) {
            return res.status(400).json({ message: "Status must be approved or denied" });
        }

        const result = await deleteRequestService.decideRequest(
            Number(req.params.id),
            req.user.id,
            status
        );

        if (status === "approved") {
            res.status(200).json({
                message: `Request approved. ${result.deletedNotifications} notification(s) and ${result.deletedReports} report(s) deleted.`,
                data: result.request,
            });
        } else {
            res.status(200).json({
                message: "Request denied. Nothing was deleted.",
                data: result.request,
            });
        }
    } catch (err) {
        if (err.message === "Request not found or already processed") {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: "Server error" });
    }
};