const activityLogRepository = require("./activityLog.repository");

exports.logActivity = async ({
    actorRole,
    actorId,
    action,
    entityType,
    entityId,
    details,
}) => {
    try {
        const { name, kifleKetema } = await activityLogRepository.getActorDetails(
            actorRole,
            actorId
        );

        await activityLogRepository.insertActivityLog({
            actorRole,
            actorId,
            actorName: name || null,
            actorKifleKetema: kifleKetema || null,
            action,
            entityType,
            entityId,
            details,
        });
    } catch (err) {
        console.error("ACTIVITY LOG ERROR:", err);
    }
};

exports.getActivityLogs = async (filters) => {
    return await activityLogRepository.getActivityLogs(filters);
};

exports.getActivityStats = async () => {
    return await activityLogRepository.getActivityStats();
};