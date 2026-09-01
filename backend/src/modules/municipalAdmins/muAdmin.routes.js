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

const {
    authenticateMuAdmin,
} = require("../../middleware/muAdminAuth.middleware");

//login
router.post(
    "/login",
    adminValidation.login,
    adminController.login
);

//get admmin dashboard numbers 
// Dashboard statistics
router.get(
    "/dashboard",
    authenticateMuAdmin,
    adminController.getDashboardStatistics
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
    adminValidation.updateReportStatus,
    adminController.updateReportStatus
);


//making delete the residnet from the admin dashbourd 
router.delete(
  "/resident/:id",
  authenticateMuAdmin,
  adminController.deleteResident
);

//making account deactivate for residnet 
router.patch(
  "/resident/:id/deactivate",
  authenticateMuAdmin,
  adminController.deactivateResident
);
//making activate resident account
router.patch(
  "/resident/:id/activate",
  authenticateMuAdmin,
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
    adminController.deleteBusinessOwner
);

router.patch(
    "/business-owner/:id/deactivate",
    authenticateMuAdmin,
    adminController.deactivateBusinessOwner
);

router.patch(
    "/business-owner/:id/activate",
    authenticateMuAdmin,
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
    onDemandRequestController.updateRequestStatus
);

router.post(
    "/collectors",
    authenticateMuAdmin,
    collectorValidation.createCollector,
    collectorController.createCollector
);

router.get(
    "/collectors",
    authenticateMuAdmin,
    collectorController.getAllCollectors
);

router.patch(
    "/schedules/:id/assign-collector",
    authenticateMuAdmin,
    collectorValidation.assignCollector,
    collectorController.assignCollectorToSchedule
);

router.patch(
    "/on-demand-requests/:id/assign-collector",
    authenticateMuAdmin,
    collectorValidation.assignCollector,
    collectorController.assignCollectorToRequest
);

router.post(
    "/notifications",
    authenticateMuAdmin,
    notificationValidation.sendManual,
    notificationController.sendManualNotification
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

module.exports = router;

