const express = require("express");
const authRoute = require("../modules/auth/auth.routes");
const residentRoute = require("../modules/residents/resident.routes");
const router = express.Router();

router.use("/auth", authRoute);
router.use("/residents", residentRoute);

module.exports = router;