const router = require("express").Router();
const notificationController = require("./notification.controller");
const authMiddleware = require("../../middleware/auth.middleware");

router.get(
    "/unread-count",
    authMiddleware.authenticate,
    notificationController.getUnreadCount
);

router.get(
    "/",
    authMiddleware.authenticate,
    notificationController.getMyNotifications
);

router.patch(
    "/read-all",
    authMiddleware.authenticate,
    notificationController.markAllAsRead
);

router.patch(
    "/:id/read",
    authMiddleware.authenticate,
    notificationController.markAsRead
);

module.exports = router;
