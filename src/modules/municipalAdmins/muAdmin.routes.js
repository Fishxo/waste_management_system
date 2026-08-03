const router = require("express").Router();

const adminController = require("./muAdmin.controller");
const adminValidation = require("./muAdmin.validation")

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

module.exports = router;