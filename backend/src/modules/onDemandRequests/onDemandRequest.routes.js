const router = require("express").Router();
const onDemandRequestController = require("./onDemandRequest.controller");
const onDemandRequestValidation = require("./onDemandRequest.validation");
const authMiddleware = require("../../middleware/auth.middleware");

router.post(
    "/",
    authMiddleware.authenticate,
    onDemandRequestValidation.createRequest,
    onDemandRequestController.createRequest
);

router.get(
    "/",
    authMiddleware.authenticate,
    onDemandRequestController.getMyRequests
);

router.get(
    "/:id",
    authMiddleware.authenticate,
    onDemandRequestController.getRequestById
);

router.patch(
    "/:id/confirm",
    authMiddleware.authenticate,
    onDemandRequestController.confirmCollection
);

module.exports = router;
