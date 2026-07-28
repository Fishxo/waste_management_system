const router = require("express").Router();
const residentController = require("./resident.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const residentValidation = require("./resident.validation");

router.get(
    "/profile",
    authMiddleware.authenticate,
    residentController.getResidentProfile
);

//getting the update profile requist for resident
router.put(
    "/profile",
    authMiddleware.authenticate,
    residentValidation.updateResidentProfile,
    residentController.updateResidentProfile
);

module.exports = router;