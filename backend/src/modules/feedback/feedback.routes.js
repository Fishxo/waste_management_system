const router = require("express").Router();
const feedbackController = require("./feedback.controller");
const feedbackValidation = require("./feedback.validation");
const authMiddleware = require("../../middleware/auth.middleware");

router.post(
    "/",
    authMiddleware.authenticate,
    feedbackValidation.createFeedback,
    feedbackController.createFeedback
);

router.get(
    "/",
    authMiddleware.authenticate,
    feedbackController.getMyFeedback
);

module.exports = router;
