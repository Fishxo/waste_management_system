const scheduleRepository = require("./schedule.repository");
const notificationService = require("../notifications/notification.service");

exports.createSchedule = async (adminId, data) => {
    const schedule = await scheduleRepository.createSchedule(
        adminId,
        data
    );

    try {
        await notificationService.notifyScheduleArea(schedule, "created");
    } catch (err) {
        console.log("SCHEDULE CREATE NOTIFICATION ERROR:", err.message);
    }

    return schedule;
};

exports.getAllSchedules = async (kifleKetema) => {
    return await scheduleRepository.getAllSchedules(kifleKetema);
};

exports.getSchedulesForResident = async (kifleKetema) => {
    return await scheduleRepository.getSchedulesByArea(kifleKetema);
};

exports.getSchedulesForBusinessOwner = async (kifleKetema, kebele) => {
    return await scheduleRepository.getSchedulesByLocation(
        kifleKetema,
        kebele
    );
};

exports.updateSchedule = async (scheduleId, data) => {
    const schedule = await scheduleRepository.updateSchedule(
        scheduleId,
        data
    );

    if (!schedule) {
        throw new Error("Schedule not found");
    }

    try {
        await notificationService.notifyScheduleArea(schedule, "updated");
    } catch (err) {
        console.log("SCHEDULE UPDATE NOTIFICATION ERROR:", err.message);
    }

    return schedule;
};
