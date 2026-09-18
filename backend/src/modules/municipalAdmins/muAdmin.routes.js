const router = require("express").Router();

const adminController = require("./muAdmin.controller");
const adminValidation = require("./muAdmin.validation")
const scheduleIssueController = require("../scheduleIssues/scheduleIssue.controller");
const scheduleIssueValidation = require("../scheduleIssues/scheduleIssue.validation");
const onDemandRequestController = require("../onDemandRequests/onDemandRequest.controller");
const onDemandRequestValidation = require("../onDemandRequests/onDemandRequest.validation");
const collectorController = require("../collectors/collector.controller");
const collectorValidation = require("../collectors/collector.validation");
const notificationController = require("../notifications/notification.controller");
const notificationValidation = require("../notifications/notification.validation");
const feedbackController = require("../feedback/feedback.controller");
const operationalReportController = require("../operationalReports/operationalReport.controller");
const operationalReportValidation = require("../operationalReports/operationalReport.validation");
const adminCommentController = require("../adminComments/adminComment.controller");
const adminCommentValidation = require("../adminComments/adminComment.validation");
const deleteRequestController = require("../deleteRequests/deleteRequest.controller");
const deleteRequestValidation = require("../deleteRequests/deleteRequest.validation");

const {
    authenticateMuAdmin,
} = require("../../middleware/muAdminAuth.middleware");

const logActivity = require("../../utils/activityLogger");
const activityOldValues = require("../../utils/activityOldValues");

const getBodyId = (req, body) => {
    const id = body?.data?.id ?? body?.data?.business_id;
    return id ? Number(id) : null;
};

//login
router.post(
    "/login",
    adminValidation.login,
    logActivity({
        action: "login",
        entityType: "session",
        getEntityId: () => null,
        resolveActor: (req, body) => ({
            actorRole: "municipal_admin",
            actorId: body?.data?.id ?? body?.data?.admin?.id ?? null,
        }),
    }),
    adminController.login
);

//logout
router.post(
    "/logout",
    authenticateMuAdmin,
    logActivity({
        action: "logout",
        entityType: "session",
        getEntityId: () => null,
    }),
    (req, res) => res.status(200).json({ message: "Logged out successfully" })
);

//get admmin dashboard numbers 
// Dashboard statistics
router.get(
    "/dashboard",
    authenticateMuAdmin,
    adminController.getDashboardStatistics
);

//get location options for schedules (kebele/sefer per sub-city)
router.get(
    "/locations",
    authenticateMuAdmin,
    adminController.getLocationOptions
);

//getting the whole reports 
router.get(
    "/reports",
    authenticateMuAdmin,
    adminController.getAllReports
);


// getting all residents
router.get(
    "/residents",
    authenticateMuAdmin,
    adminController.getAllResidents
);

// getting resident details
router.get(
    "/resident/:id",
    authenticateMuAdmin,
    adminController.getResidentById
);

//update report status
router.patch(
    "/report/:id/status",
    authenticateMuAdmin,
    logActivity({
        action: "update_report_status",
        entityType: "report",
        fetchOldValues: activityOldValues.reportOld,
    }),
    adminValidation.updateReportStatus,
    adminController.updateReportStatus
);


//making delete the residnet from the admin dashbourd 
router.delete(
  "/resident/:id",
  authenticateMuAdmin,
  logActivity({ action: "delete_resident", entityType: "resident" }),
  adminController.deleteResident
);

//making account deactivate for residnet 
router.patch(
  "/resident/:id/deactivate",
  authenticateMuAdmin,
  logActivity({ action: "deactivate_resident", entityType: "resident" }),
  adminController.deactivateResident
);
//making activate resident account
router.patch(
  "/resident/:id/activate",
  authenticateMuAdmin,
  logActivity({ action: "activate_resident", entityType: "resident" }),
  adminController.activateResident
);

router.get(
    "/business-owners",
    authenticateMuAdmin,
    adminController.getAllBusinessOwners
);

router.get(
    "/business-owner/:id",
    authenticateMuAdmin,
    adminController.getBusinessOwnerById
);

router.delete(
    "/business-owner/:id",
    authenticateMuAdmin,
    logActivity({ action: "delete_business_owner", entityType: "business_owner" }),
    adminController.deleteBusinessOwner
);

router.patch(
    "/business-owner/:id/deactivate",
    authenticateMuAdmin,
    logActivity({ action: "deactivate_business_owner", entityType: "business_owner" }),
    adminController.deactivateBusinessOwner
);

router.patch(
    "/business-owner/:id/activate",
    authenticateMuAdmin,
    logActivity({ action: "activate_business_owner", entityType: "business_owner" }),
    adminController.activateBusinessOwner
);

router.get(
    "/schedule-issues",
    authenticateMuAdmin,
    scheduleIssueValidation.listIssues,
    scheduleIssueController.getAllIssues
);

router.patch(
    "/schedule-issues/:id/status",
    authenticateMuAdmin,
    scheduleIssueValidation.updateStatus,
    logActivity({
        action: "update_schedule_issue_status",
        entityType: "schedule_issue",
        fetchOldValues: activityOldValues.scheduleIssueOld,
    }),
    scheduleIssueController.updateIssueStatus
);

router.get(
    "/on-demand-requests",
    authenticateMuAdmin,
    onDemandRequestValidation.listRequests,
    onDemandRequestController.getAllRequests
);

router.patch(
    "/on-demand-requests/:id/status",
    authenticateMuAdmin,
    onDemandRequestValidation.updateStatus,
    logActivity({
        action: "update_request_status",
        entityType: "on_demand_request",
        fetchOldValues: activityOldValues.onDemandStatusOld,
    }),
    onDemandRequestController.updateRequestStatus
);

router.delete(
    "/on-demand-requests/:id",
    authenticateMuAdmin,
    logActivity({
        action: "delete_on_demand_request",
        entityType: "on_demand_request",
    }),
    onDemandRequestController.deleteRequest
);

router.post(
    "/collectors",
    authenticateMuAdmin,
    collectorValidation.createCollector,
    logActivity({
        action: "create_collector",
        entityType: "collector",
        getEntityId: getBodyId,
    }),
    collectorController.createCollector
);

router.put(
    "/collectors/:id",
    authenticateMuAdmin,
    collectorValidation.updateCollectorProfile,
    logActivity({
        action: "update_collector",
        entityType: "collector",
        fetchOldValues: activityOldValues.collectorEditOld,
    }),
    collectorController.updateCollectorProfile
);

router.get(
    "/collectors",
    authenticateMuAdmin,
    collectorController.getAllCollectors
);

router.patch(
    "/collectors/:id/status",
    authenticateMuAdmin,
    collectorValidation.updateCollectorStatus,
    logActivity({
        action: "update_collector_status",
        entityType: "collector",
        fetchOldValues: activityOldValues.collectorActiveOld,
    }),
    collectorController.updateCollectorStatus
);

router.patch(
    "/schedules/:id/assign-collector",
    authenticateMuAdmin,
    collectorValidation.assignCollector,
    logActivity({
        action: "assign_collector_schedule",
        entityType: "schedule",
        getDetails: (req, body) => ({ collectorId: req.body.collectorId || null }),
        fetchOldValues: activityOldValues.scheduleAssignOld,
    }),
    collectorController.assignCollectorToSchedule
);

router.patch(
    "/on-demand-requests/:id/assign-collector",
    authenticateMuAdmin,
    collectorValidation.assignCollector,
    logActivity({
        action: "assign_collector_request",
        entityType: "on_demand_request",
        getDetails: (req, body) => ({ collectorId: req.body.collectorId || null }),
        fetchOldValues: activityOldValues.requestAssignOld,
    }),
    collectorController.assignCollectorToRequest
);

router.post(
    "/notifications",
    authenticateMuAdmin,
    notificationValidation.sendManual,
    logActivity({
        action: "send_notification",
        entityType: "notification",
        getEntityId: () => null,
        getDetails: (req, body) => ({
            recipientCount: body?.data?.count ?? body?.data?.recipient_count ?? null,
            recipientRole: req.body?.recipientRole || null,
            type: req.body?.type || null,
            title: req.body?.title || null,
        }),
    }),
    notificationController.sendManualNotification
);

router.get(
    "/notifications/stats",
    authenticateMuAdmin,
    notificationController.getNotificationStats
);

router.get(
    "/notifications",
    authenticateMuAdmin,
    notificationController.getSentNotifications
);

router.get(
    "/feedback",
    authenticateMuAdmin,
    feedbackController.getAllFeedback
);

router.post(
    "/operational-reports",
    authenticateMuAdmin,
    operationalReportValidation.generateReport,
    logActivity({
        action: "generate_operational_report",
        entityType: "operational_report",
        getEntityId: getBodyId,
    }),
    operationalReportController.generateReport
);

router.get(
    "/operational-reports",
    authenticateMuAdmin,
    operationalReportValidation.listReports,
    operationalReportController.getReports
);

router.get(
    "/operational-reports/:id/download",
    authenticateMuAdmin,
    operationalReportController.downloadReport
);

router.get(
    "/operational-reports/:id",
    authenticateMuAdmin,
    operationalReportController.getReportById
);

//send a comment/message to the system admin
router.post(
    "/messages",
    authenticateMuAdmin,
    adminCommentValidation.sendMessage,
    logActivity({
        action: "send_admin_message",
        entityType: "admin_comment",
        getEntityId: (req, body) => Number(body?.data?.id) || null,
    }),
    adminCommentController.sendMessage
);

//list my messages (threads) sent to the system admin
router.get(
    "/messages",
    authenticateMuAdmin,
    adminCommentController.getMyThreads
);

//unread system admin replies count for the current admin
router.get(
    "/messages/unread-count",
    authenticateMuAdmin,
    adminCommentController.getUnreadRepliesCount
);

//single message thread with replies
router.get(
    "/messages/:id",
    authenticateMuAdmin,
    adminCommentController.getMyThread
);

//reply to a message thread
router.post(
    "/messages/:id/reply",
    authenticateMuAdmin,
    adminCommentValidation.reply,
    logActivity({
        action: "reply_admin_message",
        entityType: "admin_comment",
        getEntityId: (req) => Number(req.params.id) || null,
    }),
    adminCommentController.reply
);

//request deletion of all notifications/reports in the admin's kifle ketema
//(requires system admin approval)
router.post(
    "/delete-requests",
    authenticateMuAdmin,
    deleteRequestValidation.requestDeletion,
    logActivity({
        action: "create_delete_request",
        entityType: "delete_request",
        getEntityId: (req, body) => Number(body?.data?.id) || null,
    }),
    deleteRequestController.requestDeletion
);

//list my deletion requests and their approval status
router.get(
    "/delete-requests",
    authenticateMuAdmin,
    deleteRequestController.getMyRequests
);

//list my schedule issue deletion requests and their approval status
router.get(
    "/schedule-issue-delete-requests",
    authenticateMuAdmin,
    deleteRequestController.getMyScheduleIssueRequests
);

module.exports = router;

