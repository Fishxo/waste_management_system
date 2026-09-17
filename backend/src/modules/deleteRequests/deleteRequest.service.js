const deleteRequestRepository = require("./deleteRequest.repository");

exports.requestDeletion = async (municipalAdminId, kifleKetema, requestType, notificationType, reason) => {
    const notificationsCount = await deleteRequestRepository.countScopedNotifications(
        municipalAdminId,
        kifleKetema,
        notificationType
    );
    const reportsCount = await deleteRequestRepository.countScopedReports(kifleKetema);

    return deleteRequestRepository.createRequest({
        municipalAdminId,
        requestType,
        notificationType,
        kifleKetema,
        reason,
        notificationsCount,
        reportsCount,
    });
};

exports.getMyRequests = async (municipalAdminId) => {
    return deleteRequestRepository.getRequestsByAdmin(municipalAdminId);
};

exports.getAllRequests = async () => {
    return deleteRequestRepository.getAllRequests();
};

exports.decideRequest = async (requestId, reviewerId, decision) => {
    if (decision === "approved") {
        return deleteRequestRepository.approveRequest(requestId, reviewerId);
    }
    return { request: await deleteRequestRepository.denyRequest(requestId, reviewerId) };
};