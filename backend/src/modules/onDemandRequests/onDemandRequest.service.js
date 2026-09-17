const onDemandRequestRepository = require("./onDemandRequest.repository");
const businessOwnerRepository = require("../businessOwners/businessOwner.repository");
const notificationService = require("../notifications/notification.service");

const VALID_STATUSES = ["pending", "approved", "rejected"];

exports.createRequest = async (businessId, data) => {
    const owner = await businessOwnerRepository.findBusinessOwnerById(businessId);

    if (!owner) {
        throw new Error("Business owner not found");
    }

    return await onDemandRequestRepository.createRequest(businessId, data);
};

exports.getRequestsByBusinessId = async (businessId) => {
    return await onDemandRequestRepository.getRequestsByBusinessId(businessId);
};

exports.getRequestById = async (requestId, businessId) => {
    const request = await onDemandRequestRepository.getRequestById(
        requestId,
        businessId
    );

    if (!request) {
        throw new Error("Request not found");
    }

    return request;
};

exports.getAllRequests = async (status, kifleKetema) => {
    if (status && !VALID_STATUSES.includes(status)) {
        throw new Error("Invalid status filter");
    }

    return await onDemandRequestRepository.getAllRequests(status, kifleKetema);
};

exports.updateRequestStatus = async (
    requestId,
    status,
    adminId,
    adminNotes
) => {
    if (!VALID_STATUSES.includes(status)) {
        throw new Error("Invalid status");
    }

    if (status !== "approved" && status !== "rejected") {
        throw new Error("Only approved or rejected status is allowed");
    }

    const request = await onDemandRequestRepository.findById(requestId);

    if (!request) {
        throw new Error("Request not found");
    }

    if (request.status !== "pending") {
        throw new Error("Only pending requests can be reviewed");
    }

    if (status === "approved" && !request.collector_id) {
        throw new Error("Assign a collector before approving the request");
    }

    const updated = await onDemandRequestRepository.updateRequestStatus(
        requestId,
        status,
        adminId,
        adminNotes
    );

    if (status === "approved") {
        try {
            await notificationService.notifyOne({
                recipientRole: "business_owner",
                recipientId: request.business_id,
                title: "On-Demand Request Approved",
                message: `Your on-demand collection request #${requestId} has been approved by the municipal admin.`,
                type: "request_approved",
                createdBy: adminId,
            });
        } catch (err) {
            console.log("REQUEST APPROVED NOTIFICATION ERROR:", err.message);
        }
    }

    return updated;
};

exports.deleteRequest = async (requestId) => {
    const request = await onDemandRequestRepository.findById(requestId);

    if (!request) {
        throw new Error("Request not found");
    }

    return await onDemandRequestRepository.deleteRequest(requestId);
};

exports.updateRequestByOwner = async (requestId, businessId, data) => {
    const request = await onDemandRequestRepository.getRequestById(
        requestId,
        businessId
    );

    if (!request) {
        throw new Error("Request not found");
    }

    if (request.status !== "pending") {
        throw new Error("Only pending requests can be updated");
    }

    const updated = await onDemandRequestRepository.updateRequest(
        requestId,
        businessId,
        data
    );

    if (!updated) {
        throw new Error("Only pending requests can be updated");
    }

    return updated;
};

exports.deleteRequestByOwner = async (requestId, businessId) => {
    const request = await onDemandRequestRepository.getRequestById(
        requestId,
        businessId
    );

    if (!request) {
        throw new Error("Request not found");
    }

    const deleted = await onDemandRequestRepository.deleteRequestByOwner(
        requestId,
        businessId
    );

    if (!deleted) {
        throw new Error("Request cannot be deleted at its current status");
    }

    return deleted;
};

exports.raiseIssue = async (requestId, businessId, description) => {
    const request = await onDemandRequestRepository.getRequestById(requestId, businessId);

    if (!request) throw new Error("Request not found");
    if (request.status !== "approved" || request.collection_status !== "completed") {
        throw new Error("Issues can only be raised for completed collections");
    }

    return await onDemandRequestRepository.createIssue(requestId, businessId, description);
};

exports.confirmCollection = async (requestId, businessId) => {
    const request = await onDemandRequestRepository.findById(requestId);

    if (!request || request.business_id !== businessId) {
        throw new Error("Request not found");
    }

    if (request.status !== "approved") {
        throw new Error("Only approved requests can be confirmed");
    }

    if (request.collection_status !== "completed") {
        throw new Error("Collection must be completed before confirmation");
    }

    const confirmed = await onDemandRequestRepository.confirmCollection(
        requestId,
        businessId
    );

    if (!confirmed) {
        throw new Error("Unable to confirm collection");
    }

    return confirmed;
};
