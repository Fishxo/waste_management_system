
const router = require("express").Router();

const scheduleController = require("./schedule.controller");
const scheduleValidation = require("./schedule.validation");

const {
    authenticateMuAdmin,
} = require("../../middleware/muAdminAuth.middleware");

// create schedule
router.post(
    "/",
    authenticateMuAdmin,
    scheduleValidation.createSchedule,
    scheduleController.createSchedule
);

// get all schedules
router.get(
    "/",
    authenticateMuAdmin,
    scheduleController.getAllSchedules
);

router.patch(
    "/:id",
    authenticateMuAdmin,
    scheduleValidation.updateSchedule,
    scheduleController.updateSchedule
);

module.exports = router;