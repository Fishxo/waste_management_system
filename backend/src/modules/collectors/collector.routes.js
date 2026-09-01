const router = require("express").Router();
const collectorController = require("./collector.controller");
const collectorValidation = require("./collector.validation");
const authMiddleware = require("../../middleware/auth.middleware");

router.post("/login", collectorValidation.login, collectorController.login);

router.get(
    "/dashboard",
    authMiddleware.authenticate,
    collectorController.getDashboard
);

router.patch(
    "/schedules/:id/status",
    authMiddleware.authenticate,
    collectorValidation.updateCollectionStatus,
    collectorController.updateScheduleStatus
);

router.patch(
    "/on-demand-requests/:id/status",
    authMiddleware.authenticate,
    collectorValidation.updateCollectionStatus,
    collectorController.updateOnDemandStatus
);

module.exports = router;
