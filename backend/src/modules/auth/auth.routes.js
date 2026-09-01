const router = require('express').Router();
const authController = require('./auth.controller');
const authValidation = require('./auth.validation');
const authMiddleware = require("../../middleware/auth.middleware");


//making a creation using post requist
router.post(
    "/register/resident",
    authValidation.registerResident,
    authController.registerResident
);

router.post(
    "/register/business-owner",
    authValidation.registerBusinessOwner,
    authController.registerBusinessOwner
);

//making a login logic
router.post(
    "/login",
    authValidation.loginResident,
    authController.loginResident
);

router.post(
    "/login/business-owner",
    authValidation.loginBusinessOwner,
    authController.loginBusinessOwner
);

//for the middleware protection
router.get(
    "/protected",
    authMiddleware.authenticate,
    (req, res) => {
        res.status(200).json({
            message: "You have access to this protected route",
            user: req.user,
        });
    }
);
module.exports = router;