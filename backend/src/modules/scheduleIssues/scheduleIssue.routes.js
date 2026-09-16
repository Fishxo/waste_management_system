const router = require("express").Router();

const scheduleIssueController = require("./scheduleIssue.controller");
const scheduleIssueValidation = require("./scheduleIssue.validation");
const authMiddleware = require("../../middleware/auth.middleware");
const logActivity = require("../../utils/activityLogger");

router.post(
    "/:scheduleId/issues",
    authMiddleware.authenticate,
    scheduleIssueValidation.createIssue,
    logActivity({
        action: "create_schedule_issue",
        entityType: "schedule_issue",
        getEntityId: (req, body) => {
            const id = body?.data?.id;
            return id ? Number(id) : null;
        },
    }),
    scheduleIssueController.createIssue
);

module.exports = router;
