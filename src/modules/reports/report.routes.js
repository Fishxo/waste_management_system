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

module.exports = router;