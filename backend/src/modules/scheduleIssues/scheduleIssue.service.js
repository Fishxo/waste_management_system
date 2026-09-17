const scheduleIssueRepository = require("./scheduleIssue.repository");
const residentRepository = require("../residents/resident.repository");
const businessOwnerRepository = require("../businessOwners/businessOwner.repository");

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

exports.createIssue = async (actorRole, actorId, scheduleId, description) => {
    const actor = actorRole === "business_owner"
        ? await businessOwnerRepository.findBusinessOwnerById(actorId)
        : await residentRepository.findResidentById(actorId);

    if (!actor) throw new Error(actorRole === "business_owner" ? "Business owner not found" : "Resident not found");
    if (actor.is_active === false) throw new Error("Your account has been deactivated");

    const schedule = await scheduleIssueRepository.findScheduleById(scheduleId);

    if (!schedule) {
        throw new Error("Schedule not found");
    }

    if (
        normalizeAreaValue(actor.kifle_ketema) !== normalizeAreaValue(schedule.kifle_ketema) ||
        normalizeAreaValue(actor.kebele) !== normalizeAreaValue(schedule.kebele)
    ) {
        throw new Error("You can only raise issues for schedules in your area");
    }

    const activeIssue = await scheduleIssueRepository.findActiveIssue(
        actorRole,
        actorId,
        scheduleId
    );

    if (activeIssue) {
        throw new Error("An active issue already exists for this schedule");
    }

    const issue = await scheduleIssueRepository.createIssue(
        scheduleId,
        actorRole,
        actorId,
        description.trim()
    );

    return issue;
};

exports.getAllIssues = async (status, kifleKetema, type) => {
    return await scheduleIssueRepository.getAllIssues(status, kifleKetema, type);
};

exports.getIssuesByResident = async (residentId) => {
    const issues = await scheduleIssueRepository.getIssuesByResidentId(
        residentId
    );

    return issues;
};

exports.getIssuesByBusinessOwner = async (businessId) => {
    return await scheduleIssueRepository.getIssuesByBusinessOwnerId(businessId);
};

exports.updateIssueStatus = async (issueId, status) => {
    const existing = await scheduleIssueRepository.findById(issueId);

    if (!existing) {
        throw new Error("Issue not found");
    }

    const issue = await scheduleIssueRepository.updateStatus(issueId, status);

    return issue;
};
