const router = require("express").Router();
const businessOwnerController = require("./businessOwner.controller");
const businessOwnerValidation = require("./businessOwner.validation");
const authMiddleware = require("../../middleware/auth.middleware");

router.get(
    "/profile",
    authMiddleware.authenticate,
    businessOwnerController.getBusinessOwnerProfile
);

router.put(
    "/profile",
    authMiddleware.authenticate,
    businessOwnerValidation.updateBusinessOwnerProfile,
    businessOwnerController.updateBusinessOwnerProfile
);

router.patch(
    "/profile",
    authMiddleware.authenticate,
    businessOwnerValidation.updateBusinessOwnerProfile,
    businessOwnerController.updateBusinessOwnerProfile
);

router.patch(
    "/password",
    authMiddleware.authenticate,
    businessOwnerValidation.changeBusinessOwnerPassword,
    businessOwnerController.changeBusinessOwnerPassword
);

router.get(
    "/schedules",
    authMiddleware.authenticate,
    businessOwnerController.getBusinessOwnerSchedules
);

module.exports = router;
