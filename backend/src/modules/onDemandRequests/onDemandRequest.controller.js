const onDemandRequestService = require("./onDemandRequest.service");
const { getAdminKifleKetema } = require("../../utils/adminScope");

function ensureBusinessOwner(req, res) {
    if (req.user.role !== "business_owner") {
        res.status(403).json({ message: "Access denied" });
        return false;
    }
    return true;
}

exports.createRequest = async (req, res) => {
    try {
        if (!ensureBusinessOwner(req, res)) return;

        const request = await onDemandRequestService.createRequest(
            req.user.id,
            req.body
        );

        res.status(201).json({
            message: "On-demand collection request submitted successfully",
            data: request,
        });
    } catch (err) {
        if (err.message === "Business owner not found") {
            return res.status(404).json({ message: err.message });
        }

        console.log("CREATE ON-DEMAND REQUEST ERROR:", err);

        res.status(500).json({ message: "Server error" });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        if (!ensureBusinessOwner(req, res)) return;

        const requests = await onDemandRequestService.getRequestsByBusinessId(
            req.user.id
        );

        res.status(200).json({
            message: "Requests retrieved successfully",
            data: requests,
        });
    } catch (err) {
        console.log("GET MY ON-DEMAND REQUESTS ERROR:", err);

        res.status(500).json({ message: "Server error" });
    }
};

exports.getRequestById = async (req, res) => {
    try {
        if (!ensureBusinessOwner(req, res)) return;

        const request = await onDemandRequestService.getRequestById(
            req.params.id,
            req.user.id
        );

        res.status(200).json({
            message: "Request retrieved successfully",
            data: request,
        });
    } catch (err) {
        if (err.message === "Request not found") {
            return res.status(404).json({ message: err.message });
        }

        res.status(500).json({ message: "Server error" });
    }
};

exports.getAllRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const kifleKetema = getAdminKifleKetema(req);

        const requests = await onDemandRequestService.getAllRequests(
            status,
            kifleKetema
        );

        res.status(200).json({
            message: "On-demand requests retrieved successfully",
            data: requests,
        });
    } catch (err) {
        if (err.message === "Invalid status filter") {
            return res.status(400).json({ message: err.message });
        }

        console.log("GET ALL ON-DEMAND REQUESTS ERROR:", err);

        res.status(500).json({ message: "Server error" });
    }
};

exports.updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        const adminId = req.user.id;

        const request = await onDemandRequestService.updateRequestStatus(
            id,
            status,
            adminId,
            adminNotes
        );

        res.status(200).json({
            message: `Request ${status} successfully`,
            data: request,
        });
    } catch (err) {
        if (
            err.message === "Request not found" ||
            err.message === "Only pending requests can be reviewed"
        ) {
            return res.status(400).json({ message: err.message });
        }

        if (err.message === "Invalid status") {
            return res.status(400).json({ message: err.message });
        }

        console.log("UPDATE ON-DEMAND REQUEST STATUS ERROR:", err);

        res.status(500).json({ message: "Server error" });
    }
};

exports.confirmCollection = async (req, res) => {
    try {
        if (!ensureBusinessOwner(req, res)) return;

        const request = await onDemandRequestService.confirmCollection(
            req.params.id,
            req.user.id
        );

        res.status(200).json({
            message: "Collection confirmed successfully",
            data: request,
        });
    } catch (err) {
        if (
            err.message === "Request not found" ||
            err.message === "Only approved requests can be confirmed" ||
            err.message === "Collection must be completed before confirmation" ||
            err.message === "Unable to confirm collection"
        ) {
            return res.status(400).json({ message: err.message });
        }

        res.status(500).json({ message: "Server error" });
    }
};
