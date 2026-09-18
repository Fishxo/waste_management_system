const express = require("express");
const router = express.Router();
const systemAdminController = require("./systemAdmin.controller");
const systemAdminValidation = require("./systemAdmin.validation");
const activityLogController = require("../activityLogs/activityLog.controller");
const logActivity = require("../../utils/activityLogger");
const activityOldValues = require("../../utils/activityOldValues");
const adminCommentController = require("../adminComments/adminComment.controller");
const adminCommentValidation = require("../adminComments/adminComment.validation");
const deleteRequestController = require("../deleteRequests/deleteRequest.controller");
const deleteRequestValidation = require("../deleteRequests/deleteRequest.validation");
const feedbackController = require("../feedback/feedback.controller");
const {
    authenticateSystemAdmin,
} = require("../../middleware/systemAdminAuth.middleware");

const getBodyId = (req, body) => {
    const id = body?.data?.id;
    return id ? Number(id) : null;
};

router.post(
    "/login",
    systemAdminValidation.login,
    logActivity({
        action: "login",
        entityType: "session",
        getEntityId: () => null,
        resolveActor: (req, body) => ({
            actorRole: "system_admin",
            actorId: body?.data?.id ?? null,
        }),
    }),
    systemAdminController.login
);

router.post(
    "/logout",
    authenticateSystemAdmin,
    logActivity({
        action: "logout",
        entityType: "session",
        getEntityId: () => null,
    }),
    (req, res) => res.status(200).json({ message: "Logged out successfully" })
);

router.get(
    "/dashboard",
    authenticateSystemAdmin,
    systemAdminController.getDashboardStats
);

router.get(
    "/municipal-admins",
    authenticateSystemAdmin,
    systemAdminController.getMunicipalAdmins
);

router.post(
    "/municipal-admins",
    authenticateSystemAdmin,
    systemAdminValidation.createMunicipalAdmin,
    logActivity({
        action: "create_municipal_admin",
        entityType: "municipal_admin",
        getEntityId: getBodyId,
    }),
    systemAdminController.createMunicipalAdmin
);

router.put(
    "/municipal-admins/:id",
    authenticateSystemAdmin,
    systemAdminValidation.updateMunicipalAdmin,
    logActivity({
        action: "update_municipal_admin",
        entityType: "municipal_admin",
        fetchOldValues: activityOldValues.municipalAdminEditOld,
    }),
    systemAdminController.updateMunicipalAdmin
);

router.patch(
    "/municipal-admins/:id/status",
    authenticateSystemAdmin,
    systemAdminValidation.updateMunicipalAdminStatus,
    logActivity({
        action: "update_municipal_admin_status",
        entityType: "municipal_admin",
        fetchOldValues: activityOldValues.municipalAdminActiveOld,
    }),
    systemAdminController.updateMunicipalAdminStatus
);

router.get(
    "/collectors",
    authenticateSystemAdmin,
    systemAdminController.getCollectors
);

router.post(
    "/collectors",
    authenticateSystemAdmin,
    systemAdminValidation.createCollector,
    logActivity({
        action: "create_collector",
        entityType: "collector",
        getEntityId: getBodyId,
    }),
    systemAdminController.createCollector
);

router.put(
    "/collectors/:id",
    authenticateSystemAdmin,
    systemAdminValidation.updateCollector,
    logActivity({
        action: "update_collector",
        entityType: "collector",
    }),
    systemAdminController.updateCollector
);

router.patch(
    "/collectors/:id/activate",
    authenticateSystemAdmin,
    logActivity({ action: "activate_collector", entityType: "collector" }),
    systemAdminController.activateCollector
);

router.patch(
    "/collectors/:id/deactivate",
    authenticateSystemAdmin,
    logActivity({ action: "deactivate_collector", entityType: "collector" }),
    systemAdminController.deactivateCollector
);

router.get(
    "/residents",
    authenticateSystemAdmin,
    systemAdminController.getResidents
);

router.patch(
    "/residents/:id/activate",
    authenticateSystemAdmin,
    logActivity({ action: "activate_resident", entityType: "resident" }),
    systemAdminController.activateResident
);

router.patch(
    "/residents/:id/deactivate",
    authenticateSystemAdmin,
    logActivity({ action: "deactivate_resident", entityType: "resident" }),
    systemAdminController.deactivateResident
);

router.get(
    "/business-owners",
    authenticateSystemAdmin,
    systemAdminController.getBusinessOwners
);

router.patch(
    "/business-owners/:id/activate",
    authenticateSystemAdmin,
    logActivity({ action: "activate_business_owner", entityType: "business_owner" }),
    systemAdminController.activateBusinessOwner
);

router.patch(
    "/business-owners/:id/deactivate",
    authenticateSystemAdmin,
    logActivity({ action: "deactivate_business_owner", entityType: "business_owner" }),
    systemAdminController.deactivateBusinessOwner
);

router.post(
    "/backup",
    authenticateSystemAdmin,
    logActivity({
        action: "create_backup",
        entityType: "backup",
        getEntityId: getBodyId,
    }),
    systemAdminController.createBackup
);

router.get(
    "/backups",
    authenticateSystemAdmin,
    systemAdminController.listBackups
);

router.get(
    "/backups/:id/download",
    authenticateSystemAdmin,
    systemAdminController.downloadBackup
);

router.post(
    "/restore",
    authenticateSystemAdmin,
    systemAdminValidation.restoreDatabase,
    logActivity({ action: "restore_database", entityType: "database" }),
    systemAdminController.restoreDatabase
);

router.get(
    "/activity-logs",
    authenticateSystemAdmin,
    activityLogController.getActivityLogs
);

router.get(
    "/activity-logs/stats",
    authenticateSystemAdmin,
    activityLogController.getActivityStats
);

router.get(
    "/reports",
    authenticateSystemAdmin,
    systemAdminController.getReports
);

router.get(
    "/reports/stats",
    authenticateSystemAdmin,
    systemAdminController.getReportsStats
);

router.get(
    "/feedback",
    authenticateSystemAdmin,
    feedbackController.getAllFeedback
);

//list all messages/comments sent by municipal admins
router.get(
    "/messages",
    authenticateSystemAdmin,
    adminCommentController.getAllThreads
);

//unread message count from municipal admins
router.get(
    "/messages/unread-count",
    authenticateSystemAdmin,
    adminCommentController.getUnreadCount
);

//single message thread with replies
router.get(
    "/messages/:id",
    authenticateSystemAdmin,
    adminCommentController.getThreadForSystemAdmin
);

//reply to a message thread
router.post(
    "/messages/:id/reply",
    authenticateSystemAdmin,
    adminCommentValidation.reply,
    logActivity({
        action: "reply_admin_message",
        entityType: "admin_comment",
        getEntityId: (req) => Number(req.params.id) || null,
    }),
    adminCommentController.replyAsSystemAdmin
);

//list all deletion requests from municipal admins (pending first)
router.get(
    "/delete-requests",
    authenticateSystemAdmin,
    deleteRequestController.getAllRequests
);

//approve or deny a deletion request
router.patch(
    "/delete-requests/:id/decision",
    authenticateSystemAdmin,
    deleteRequestValidation.decideRequest,
    logActivity({
        action: "decide_delete_request",
        entityType: "delete_request",
        getDetails: (req, body) => ({
            decision: req.body?.status || null,
            deletedNotifications: body?.data?.deleted_notifications ?? null,
            deletedReports: body?.data?.deleted_reports ?? null,
            deletedScheduleIssues: body?.data?.deleted_schedule_issues ?? null,
        }),
    }),
    deleteRequestController.decideRequest
);

module.exports = router;
