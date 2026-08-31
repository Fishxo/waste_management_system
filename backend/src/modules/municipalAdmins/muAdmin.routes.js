const router = require("express").Router();

const adminController = require("./muAdmin.controller");
const adminValidation = require("./muAdmin.validation")
const scheduleIssueController = require("../scheduleIssues/scheduleIssue.controller");
const scheduleIssueValidation = require("../scheduleIssues/scheduleIssue.validation");

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

module.exports = router;

