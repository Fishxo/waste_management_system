const notificationService = require("./notification.service");

function getRecipient(req) {
    return {
        role: req.user.role,
        id: req.user.id,
    };
}

exports.getMyNotifications = async (req, res) => {
    try {
        const { role, id } = getRecipient(req);

        if (!["resident", "business_owner", "collector"].includes(role)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const notifications = await notificationService.getNotifications(
            role,
            id
        );

        res.status(200).json({
            message: "Notifications retrieved successfully",
            data: notifications,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const { role, id } = getRecipient(req);

        if (!["resident", "business_owner", "collector"].includes(role)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const count = await notificationService.getUnreadCount(role, id);

        res.status(200).json({ count });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { role, id } = getRecipient(req);

        const notification = await notificationService.markAsRead(
            req.params.id,
            role,
            id
        );

        res.status(200).json({
            message: "Notification marked as read",
            data: notification,
        });
    } catch (err) {
        if (err.message === "Notification not found") {
            return res.status(404).json({ message: err.message });
        }

        res.status(500).json({ message: "Server error" });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const { role, id } = getRecipient(req);

        await notificationService.markAllAsRead(role, id);

        res.status(200).json({
            message: "All notifications marked as read",
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.sendManualNotification = async (req, res) => {
    try {
        const notifications = await notificationService.sendManualNotification(
            req.user.id,
            req.body
        );

        res.status(201).json({
            message: `Notification sent to ${notifications.length} recipient(s)`,
            data: { count: notifications.length },
        });
    } catch (err) {
        if (
            err.message === "Invalid recipient role" ||
            err.message === "No recipients found for this notification"
        ) {
            return res.status(400).json({ message: err.message });
        }

        res.status(500).json({ message: "Server error" });
    }
};
