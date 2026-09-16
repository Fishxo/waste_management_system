const router = require("express").Router();
const collectorController = require("./collector.controller");
const collectorValidation = require("./collector.validation");
const authMiddleware = require("../../middleware/auth.middleware");
const logActivity = require("../../utils/activityLogger");
const activityOldValues = require("../../utils/activityOldValues");

router.post(
    "/login",
    collectorValidation.login,
    logActivity({
        action: "login",
        entityType: "session",
        getEntityId: () => null,
        resolveActor: (req, body) => ({
            actorRole: "collector",
            actorId: body?.data?.id ?? null,
        }),
    }),
    collectorController.login
);

router.post(
    "/logout",
    authMiddleware.authenticate,
    logActivity({
        action: "logout",
        entityType: "session",
        getEntityId: () => null,
    }),
    (req, res) => res.status(200).json({ message: "Logged out successfully" })
);

router.get(
    "/dashboard",
    authMiddleware.authenticate,
    collectorController.getDashboard
);

router.patch(
    "/password",
    authMiddleware.authenticate,
    collectorValidation.changePassword,
    collectorController.changePassword
);

router.patch(
    "/schedules/:id/status",
    authMiddleware.authenticate,
    collectorValidation.updateCollectionStatus,
    logActivity({
        action: "update_collection_status",
        entityType: "schedule",
        fetchOldValues: activityOldValues.scheduleCollectionOld,
    }),
    collectorController.updateScheduleStatus
);

router.patch(
    "/on-demand-requests/:id/status",
    authMiddleware.authenticate,
    collectorValidation.updateCollectionStatus,
    logActivity({
        action: "update_collection_status",
        entityType: "on_demand_request",
        fetchOldValues: activityOldValues.onDemandCollectionOld,
    }),
    collectorController.updateOnDemandStatus
);

module.exports = router;
