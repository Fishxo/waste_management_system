const scheduleRepository = require("./schedule.repository");
const notificationService = require("../notifications/notification.service");

const notifyAssignedCollector = async (schedule, collectorId) => {
    try {
        await notificationService.notifyOne({
            recipientRole: "collector",
            recipientId: collectorId,
            title: "New Schedule Assignment",
            message: `You have been assigned to a collection schedule in ${schedule.kifle_ketema}, Kebele ${schedule.kebele} on ${schedule.collection_date}.`,
            type: "collector_assigned",
        });
    } catch (err) {
        console.log("SCHEDULE ASSIGN NOTIFICATION ERROR:", err.message);
    }
};

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

    if (data.collectorId) {
        await notifyAssignedCollector(schedule, data.collectorId);
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
    const existing = await scheduleRepository.getScheduleById(scheduleId);
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

    if (
        data.collectorId &&
        Number(data.collectorId) !== Number(existing?.collector_id)
    ) {
        await notifyAssignedCollector(schedule, data.collectorId);
    }

    return schedule;
};
