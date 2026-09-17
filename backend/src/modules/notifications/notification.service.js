const notificationRepository = require("./notification.repository");
const crypto = require("crypto");

const VALID_ROLES = ["resident", "business_owner", "collector"];

async function notifyOne({ recipientRole, recipientId, title, message, type, createdBy }) {
    return await notificationRepository.createNotification({
        recipientRole,
        recipientId,
        title,
        message,
        type,
        createdBy,
    });
}

exports.notifyOne = notifyOne;

exports.notifyMany = async (recipients, payload) => {
    if (!recipients.length) return [];

    const broadcastId = payload.broadcastId || crypto.randomUUID();

    const notifications = recipients.map((recipientId) => ({
        recipientRole: payload.recipientRole,
        recipientId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        createdBy: payload.createdBy || null,
        broadcastId,
    }));

    return await notificationRepository.createBulkNotifications(notifications);
};

exports.notifyScheduleArea = async (schedule, action = "updated") => {
    const title =
        action === "created"
            ? "New Collection Schedule"
            : "Collection Schedule Updated";
    const timeRange = schedule.end_time
        ? `${schedule.collection_time} - ${schedule.end_time}`
        : schedule.collection_time;
    const message = `Waste collection for ${schedule.kifle_ketema}, Kebele ${schedule.kebele} (${schedule.sefer}) is scheduled on ${schedule.collection_date} from ${timeRange}.`;

    const residentIds = await notificationRepository.getResidentIdsByArea(
        schedule.kifle_ketema,
        schedule.kebele
    );
    const businessIds = await notificationRepository.getBusinessOwnerIdsByArea(
        schedule.kifle_ketema,
        schedule.kebele
    );

    await exports.notifyMany(residentIds, {
        recipientRole: "resident",
        title,
        message,
        type: "schedule_update",
    });

    await exports.notifyMany(businessIds, {
        recipientRole: "business_owner",
        title,
        message,
        type: "schedule_update",
    });
};

exports.getNotifications = async (recipientRole, recipientId) => {
    return await notificationRepository.getNotificationsForUser(
        recipientRole,
        recipientId
    );
};

exports.getUnreadCount = async (recipientRole, recipientId) => {
    return await notificationRepository.getUnreadCount(recipientRole, recipientId);
};

exports.markAsRead = async (notificationId, recipientRole, recipientId) => {
    const notification = await notificationRepository.markAsRead(
        notificationId,
        recipientRole,
        recipientId
    );

    if (!notification) {
        throw new Error("Notification not found");
    }

    return notification;
};

exports.markAllAsRead = async (recipientRole, recipientId) => {
    return await notificationRepository.markAllAsRead(recipientRole, recipientId);
};

exports.deleteNotification = async (notificationId, recipientRole, recipientId) => {
    const notification = await notificationRepository.deleteNotification(
        notificationId,
        recipientRole,
        recipientId
    );

    if (!notification) {
        throw new Error("Notification not found");
    }

    return notification;
};

exports.deleteAllNotifications = async (recipientRole, recipientId) => {
    return await notificationRepository.deleteAllNotifications(recipientRole, recipientId);
};

exports.sendManualNotification = async (adminId, adminKifle, data) => {
    const { recipientRole, recipientId, title, message } = data;

    if (!VALID_ROLES.includes(recipientRole)) {
        throw new Error("Invalid recipient role");
    }

    const payload = {
        recipientRole,
        title,
        message,
        type: "manual",
        createdBy: adminId,
    };

    if (recipientId) {
        return [
            await notifyOne({
                ...payload,
                recipientId: Number(recipientId),
            }),
        ];
    }

    if (!adminKifle) {
        throw new Error("Your account is not assigned to a sub-city");
    }

    const ids = await notificationRepository.getAllRecipientIds(
        recipientRole,
        adminKifle
    );

    if (!ids.length) {
        throw new Error("No recipients found for this notification");
    }

    return await exports.notifyMany(ids, {
        ...payload,
        broadcastId: crypto.randomUUID(),
    });
};

exports.getNotificationsForAdmin = async (filters) => {
    return await notificationRepository.getNotificationsForAdmin(filters);
};

exports.getNotificationStats = async (adminId, adminKifle) => {
    return await notificationRepository.getNotificationStats(
        adminId || null,
        adminKifle || null
    );
};
