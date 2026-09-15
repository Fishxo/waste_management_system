const router = require("express").Router();

const reportController = require("./report.controller");
const reportValidation = require("./report.validation");
const authMiddleware = require("../../middleware/auth.middleware");

router.post(
    "/",
    authMiddleware.authenticate,
    reportValidation.createReport,
    reportController.createReport
);

router.get(
    "/",
    authMiddleware.authenticate,
    reportController.getMyReports
);

//getting the daily report limit usage for the resident 
router.get(
    "/daily-count",
    authMiddleware.authenticate,
    reportController.getDailyCount
);

//getting the report by report id 
router.get(
    "/:id",
    authMiddleware.authenticate,
    reportController.getReportById
);

//getting the report history 
router.get(
    "/:id/history",
    authMiddleware.authenticate,
    reportController.getReportHistory
);

//report updating from the user side 
router.put(
    "/:id",
    authMiddleware.authenticate,
    reportValidation.updateReport,
    reportController.updateReport

);

//making delete a report from the resident side 
router.delete(
    "/:id",
    authMiddleware.authenticate,
    reportValidation.deleteReport,
    reportController.deleteReport
);

module.exports = router;