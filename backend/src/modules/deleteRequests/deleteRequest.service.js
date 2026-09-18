const deleteRequestRepository = require("./deleteRequest.repository");

exports.requestDeletion = async (municipalAdminId, kifleKetema, requestType, notificationType, reason) => {
    const pending = await deleteRequestRepository.findPendingRequest(municipalAdminId);
    if (pending) {
        const error = new Error(
            "You already have a pending delete request awaiting system admin approval"
        );
        error.statusCode = 409;
        throw error;
    }

    const targetsScheduleIssues = requestType === "schedule_issues";
    const notificationsCount = targetsScheduleIssues
        ? 0
        : await deleteRequestRepository.countScopedNotifications(
              municipalAdminId,
              kifleKetema,
              notificationType
          );
    const reportsCount = targetsScheduleIssues
        ? 0
        : await deleteRequestRepository.countScopedReports(kifleKetema);
    const scheduleIssuesCount = targetsScheduleIssues
        ? await deleteRequestRepository.countScopedScheduleIssues(kifleKetema)
        : 0;

    return deleteRequestRepository.createRequest({
        municipalAdminId,
        requestType,
        notificationType,
        kifleKetema,
        reason,
        notificationsCount,
        reportsCount,
        scheduleIssuesCount,
    });
};

exports.getMyRequests = async (municipalAdminId) => {
    return deleteRequestRepository.getRequestsByAdmin(municipalAdminId);
};

exports.getMyScheduleIssueRequests = async (municipalAdminId) => {
    return deleteRequestRepository.getScheduleIssueRequestsByAdmin(municipalAdminId);
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