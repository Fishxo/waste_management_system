const express = require("express");
const authRoute = require("../modules/auth/auth.routes");
const residentRoute = require("../modules/residents/resident.routes");
const reportRoutes = require("../modules/reports/report.routes");
const municipalAdmin = require("../modules/municipalAdmins/muAdmin.routes");
const scheduleRoutes = require("../modules/schedules/schedule.route");
const router = express.Router();

router.use("/auth", authRoute);
router.use("/residents", residentRoute);
router.use("/reports", reportRoutes);
router.use("/muAdmin", municipalAdmin);
router.use("/muAdmin/schedules", scheduleRoutes);

module.exports = router;