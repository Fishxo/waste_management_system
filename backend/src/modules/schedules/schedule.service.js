const scheduleRepository = require("./schedule.repository");

// create schedule
exports.createSchedule = async (adminId, data) => {

    const schedule = await scheduleRepository.createSchedule(
        adminId,
        data
    );

    return schedule;
};

// get all schedules
exports.getAllSchedules = async () => {

    const schedules = await scheduleRepository.getAllSchedules();

    return schedules;
};

// get schedules for a resident's sub-city
exports.getSchedulesForResident = async (kifleKetema) => {
    const schedules = await scheduleRepository.getSchedulesByArea(kifleKetema);

    return schedules;
};

//updating the schedules 
exports.updateSchedule = async (scheduleId,data) => {
    const schedule = await scheduleRepository.updateSchedule(
        scheduleId,
        data
    );

    if (!schedule) {
        throw new Error("Schedule not found")
    }
    
    return schedule;    
}