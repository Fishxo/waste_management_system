const scheduleService = require("./schedule.service");

// create schedule
exports.createSchedule = async (req, res) => {

    try {

        const adminId = req.user.id;

        const schedule = await scheduleService.createSchedule(
            adminId,
            req.body
        );

        res.status(201).json({
            message: "Schedule created successfully",
            data: schedule,
        });

    } catch (err) {

        console.log("CREATE SCHEDULE ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });

    }

};


// get all schedules
exports.getAllSchedules = async (req, res) => {

    try {

        const schedules = await scheduleService.getAllSchedules();

        res.status(200).json({
            message: "Schedules retrieved successfully",
            data: schedules,
        });

    } catch (err) {

        console.log("GET SCHEDULES ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });

    }

};

// update schedule
exports.updateSchedule = async (req, res) => {

    try {

        const { id } = req.params;

        const schedule = await scheduleService.updateSchedule(
            id,
            req.body
        );

        res.status(200).json({
            message: "Schedule updated successfully",
            data: schedule,
        });

    } catch (err) {

        if (err.message === "Schedule not found") {
            return res.status(404).json({
                message: err.message,
            });
        }

        console.log("UPDATE SCHEDULE ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });

    }

};