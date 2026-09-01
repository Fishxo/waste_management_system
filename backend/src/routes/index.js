const express = require("express");
const authRoute = require("../modules/auth/auth.routes");
const residentRoute = require("../modules/residents/resident.routes");
const reportRoutes = require("../modules/reports/report.routes");
const municipalAdmin = require("../modules/municipalAdmins/muAdmin.routes");
const systemAdminRoutes = require("../modules/systemAdmins/systemAdmin.routes");
const scheduleRoutes = require("../modules/schedules/schedule.route");
const scheduleIssueRoutes = require("../modules/scheduleIssues/scheduleIssue.routes");
const businessOwnerRoute = require("../modules/businessOwners/businessOwner.routes");
const onDemandRequestRoutes = require("../modules/onDemandRequests/onDemandRequest.routes");
const collectorRoutes = require("../modules/collectors/collector.routes");
const notificationRoutes = require("../modules/notifications/notification.routes");
const feedbackRoutes = require("../modules/feedback/feedback.routes");
const router = express.Router();

router.use("/auth", authRoute);
router.use("/residents", residentRoute);
router.use("/businessOwners", businessOwnerRoute);
router.use("/onDemandRequests", onDemandRequestRoutes);
router.use("/collectors", collectorRoutes);
router.use("/notifications", notificationRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/reports", reportRoutes);
router.use("/muAdmin", municipalAdmin);
router.use("/systemAdmin", systemAdminRoutes);
router.use("/muAdmin/schedules", scheduleRoutes);
router.use("/schedules", scheduleIssueRoutes);

module.exports = router;