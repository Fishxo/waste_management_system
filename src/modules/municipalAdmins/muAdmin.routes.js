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

//update report status
router.patch(
    "/report/:id/status",
    authenticateMuAdmin,
    adminValidation.updateReportStatus,
    adminController.updateReportStatus
);

module.exports = router;