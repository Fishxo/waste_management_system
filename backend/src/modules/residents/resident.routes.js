const router = require("express").Router();
const residentController = require("./resident.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const residentValidation = require("./resident.validation");

router.get(
    "/profile",
    authMiddleware.authenticate,
    residentController.getResidentProfile
);

router.get(
    "/schedules",
    authMiddleware.authenticate,
    residentController.getResidentSchedules
);

//getting the update profile requist for resident
router.put(
    "/profile",
    authMiddleware.authenticate,
    residentValidation.updateResidentProfile,
    residentController.updateResidentProfile
);

router.patch(
    "/profile",
    authMiddleware.authenticate,
    residentValidation.updateResidentProfile,
    residentController.updateResidentProfile
);

router.patch(
    "/password",
    authMiddleware.authenticate,
    residentValidation.changeResidentPassword,
    residentController.changeResidentPassword
);

module.exports = router;