const scheduleIssueRepository = require("./scheduleIssue.repository");
const residentRepository = require("../residents/resident.repository");

function normalizeAreaValue(value) {
    return String(value ?? "").trim().toLowerCase();
}

function residentBelongsToScheduleArea(resident, schedule) {
    return (
        normalizeAreaValue(resident.kifle_ketema) ===
            normalizeAreaValue(schedule.kifle_ketema) &&
        normalizeAreaValue(resident.kebele) ===
            normalizeAreaValue(schedule.kebele) &&
        normalizeAreaValue(resident.sefer) ===
            normalizeAreaValue(schedule.sefer)
    );
}

exports.createIssue = async (residentId, scheduleId, description) => {
    const resident = await residentRepository.findResidentById(residentId);

    if (!resident) {
        throw new Error("Resident not found");
    }

    const schedule = await scheduleIssueRepository.findScheduleById(scheduleId);

    if (!schedule) {
        throw new Error("Schedule not found");
    }

    if (!residentBelongsToScheduleArea(resident, schedule)) {
        throw new Error("You can only raise issues for schedules in your area");
    }

    const activeIssue = await scheduleIssueRepository.findActiveIssue(
        residentId,
        scheduleId
    );

    if (activeIssue) {
        throw new Error("An active issue already exists for this schedule");
    }

    const issue = await scheduleIssueRepository.createIssue(
        scheduleId,
        residentId,
        description.trim()
    );

    return issue;
};

exports.getAllIssues = async (status) => {
    const issues = await scheduleIssueRepository.getAllIssues(status);

    return issues;
};

exports.getIssuesByResident = async (residentId) => {
    const issues = await scheduleIssueRepository.getIssuesByResidentId(
        residentId
    );

    return issues;
};

exports.updateIssueStatus = async (issueId, status) => {
    const existing = await scheduleIssueRepository.findById(issueId);

    if (!existing) {
        throw new Error("Issue not found");
    }

    const issue = await scheduleIssueRepository.updateStatus(issueId, status);

    return issue;
};
