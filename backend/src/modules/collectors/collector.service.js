const { normalizeIdentifier } = require("../../utils/authIdentifier");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const collectorRepository = require("./collector.repository");
const onDemandRequestRepository = require("../onDemandRequests/onDemandRequest.repository");
const notificationService = require("../notifications/notification.service");

const COLLECTOR_UPDATE_STATUSES = ["pending", "in_progress", "completed", "failed"];

const COLLECTOR_LIFECYCLE_STATUSES = ["active", "inactive", "resigned"];

const STATUS_TRANSITIONS = {
    assigned: ["pending", "in_progress", "completed", "failed"],
    pending: ["in_progress", "completed", "failed"],
    in_progress: ["pending", "completed", "failed"],
    completed: ["pending", "in_progress", "failed"],
    failed: ["pending", "in_progress", "completed"],
};

exports.createCollector = async (adminId, data) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await collectorRepository.createCollector(adminId, {
        ...data,
        passwordHash: hashedPassword,
    });
};

exports.login = async (identifier, password) => {
    const collector = await collectorRepository.findCollectorByIdentifier(
        normalizeIdentifier(identifier)
    );

    if (!collector) {
        throw new Error("Invalid email or password");
    }

    if (collector.status === "resigned") {
        throw new Error("Your account has been resigned");
    }

    if (collector.is_active === false) {
        throw new Error("Your account has been deactivated");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        collector.password_hash
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        {
            id: collector.id,
            email: collector.email,
            role: "collector",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    delete collector.password_hash;

    return { collector, token };
};

exports.getAllCollectors = async (kifleKetema) => {
    return await collectorRepository.getAllCollectors(kifleKetema);
};

exports.updateCollectorStatus = async (
    adminKifleKetema,
    id,
    status,
    reason
) => {
    if (!COLLECTOR_LIFECYCLE_STATUSES.includes(status)) {
        throw new Error("Invalid collector status");
    }

    const collector = await collectorRepository.updateCollectorStatus(
        id,
        status,
        reason,
        adminKifleKetema
    );

    if (!collector) {
        throw new Error("Collector not found");
    }

    return collector;
};

exports.updateCollectorProfile = async (adminKifleKetema, id, data) => {
    const passwordHash = data.password
        ? await bcrypt.hash(data.password, 10)
        : null;

    const collector = await collectorRepository.updateCollectorProfile(
        id,
        data,
        passwordHash,
        adminKifleKetema
    );

    if (!collector) {
        throw new Error("Collector not found");
    }

    return collector;
};

exports.changePassword = async (id, currentPassword, newPassword) => {
    const collector = await collectorRepository.findCollectorPasswordById(id);

    if (!collector) {
        throw new Error("Collector not found");
    }

    const isMatch = await bcrypt.compare(
        currentPassword,
        collector.password_hash
    );

    if (!isMatch) {
        throw new Error("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await collectorRepository.updateCollectorPassword(id, hashedPassword);
};

exports.getDashboard = async (collectorId) => {
    const collector = await collectorRepository.findCollectorById(collectorId);

    if (!collector) {
        throw new Error("Collector not found");
    }

    const schedules =
        await collectorRepository.getAssignedSchedules(collectorId);
    const onDemandRequests =
        await collectorRepository.getAssignedOnDemandRequests(collectorId);

    return { collector, schedules, onDemandRequests };
};

exports.updateScheduleStatus = async (collectorId, scheduleId, status, notes) => {
    if (!COLLECTOR_UPDATE_STATUSES.includes(status)) {
        throw new Error("Invalid collection status");
    }

    const schedules = await collectorRepository.getAssignedSchedules(collectorId);
    const schedule = schedules.find((s) => s.id === Number(scheduleId));

    if (!schedule) {
        throw new Error("Schedule not found or not assigned to you");
    }

    const allowed = STATUS_TRANSITIONS[schedule.status] || [];

    if (!allowed.includes(status)) {
        throw new Error(
            `Cannot change status from ${schedule.status} to ${status}`
        );
    }

    const updated = await collectorRepository.updateScheduleCollectionStatus(
        scheduleId,
        collectorId,
        status,
        notes
    );

    if (!updated) {
        throw new Error("Failed to update schedule status");
    }

    return updated;
};

exports.updateOnDemandStatus = async (
    collectorId,
    requestId,
    status,
    notes
) => {
    if (!COLLECTOR_UPDATE_STATUSES.includes(status)) {
        throw new Error("Invalid collection status");
    }

    const requests =
        await collectorRepository.getAssignedOnDemandRequests(collectorId);
    const request = requests.find((r) => r.id === Number(requestId));

    if (!request) {
        throw new Error("Request not found or not assigned to you");
    }

    const allowed = STATUS_TRANSITIONS[request.collection_status] || [];

    if (!allowed.includes(status)) {
        throw new Error(
            `Cannot change status from ${request.collection_status} to ${status}`
        );
    }

    const updated = await collectorRepository.updateOnDemandCollectionStatus(
        requestId,
        collectorId,
        status,
        notes
    );

    if (!updated) {
        throw new Error("Failed to update request status");
    }

    if (status === "completed") {
        try {
            const fullRequest = await onDemandRequestRepository.findById(requestId);
            if (fullRequest) {
                await notificationService.notifyOne({
                    recipientRole: "business_owner",
                    recipientId: fullRequest.business_id,
                    title: "Collection Completed",
                    message: `Your on-demand collection request #${requestId} has been marked as completed. Please confirm when ready.`,
                    type: "collection_completed",
                });
            }
        } catch (err) {
            console.log("COLLECTION COMPLETED NOTIFICATION ERROR:", err.message);
        }
    }

    return updated;
};

exports.assignCollectorToSchedule = async (scheduleId, collectorId) => {
    const collector = await collectorRepository.findCollectorById(collectorId);

    if (!collector || collector.is_active === false) {
        throw new Error("Collector not found");
    }

    const schedule = await collectorRepository.assignCollectorToSchedule(
        scheduleId,
        collectorId
    );

    if (!schedule) {
        throw new Error("Schedule not found");
    }

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

    return schedule;
};

exports.assignCollectorToRequest = async (requestId, collectorId) => {
    const collector = await collectorRepository.findCollectorById(collectorId);

    if (!collector || collector.is_active === false) {
        throw new Error("Collector not found");
    }

    const request = await collectorRepository.assignCollectorToRequest(
        requestId,
        collectorId
    );

    if (!request) {
        throw new Error("Approved request not found");
    }

    try {
        await notificationService.notifyOne({
            recipientRole: "collector",
            recipientId: collectorId,
            title: "New On-Demand Assignment",
            message: `You have been assigned to on-demand collection request #${requestId}.`,
            type: "collector_assigned",
        });

        await notificationService.notifyOne({
            recipientRole: "business_owner",
            recipientId: request.business_id,
            title: "Collector Assigned",
            message: `A collector has been assigned to your on-demand request #${requestId}.`,
            type: "collector_assigned",
        });
    } catch (err) {
        console.log("REQUEST ASSIGN NOTIFICATION ERROR:", err.message);
    }

    return request;
};
