const router = require("express").Router();

const scheduleIssueController = require("./scheduleIssue.controller");
const scheduleIssueValidation = require("./scheduleIssue.validation");
const authMiddleware = require("../../middleware/auth.middleware");

router.post(
    "/:scheduleId/issues",
    authMiddleware.authenticate,
    scheduleIssueValidation.createIssue,
    scheduleIssueController.createIssue
);

module.exports = router;
