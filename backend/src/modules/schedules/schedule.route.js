
const router = require("express").Router();

const scheduleController = require("./schedule.controller");
const scheduleValidation = require("./schedule.validation");

const {
    authenticateMuAdmin,
} = require("../../middleware/muAdminAuth.middleware");

const logActivity = require("../../utils/activityLogger");

// create schedule
router.post(
    "/",
    authenticateMuAdmin,
    scheduleValidation.createSchedule,
    logActivity({
        action: "create_schedule",
        entityType: "schedule",
        getEntityId: (req, body) => {
            const id = body?.data?.id;
            return id ? Number(id) : null;
        },
    }),
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
    logActivity({ action: "update_schedule", entityType: "schedule" }),
    scheduleController.updateSchedule
);

module.exports = router;