exports.sendManual = (req, res, next) => {
    const { recipientRole, title, message } = req.body;

    if (!recipientRole || !title || !message) {
        return res.status(400).json({
            message: "Recipient role, title, and message are required",
        });
    }

    if (!["resident", "business_owner", "collector"].includes(recipientRole)) {
        return res.status(400).json({
            message: "Invalid recipient role",
        });
    }

    if (title.length > 200) {
        return res.status(400).json({
            message: "Title must be 200 characters or less",
        });
    }

    if (message.length > 2000) {
        return res.status(400).json({
            message: "Message must be 2000 characters or less",
        });
    }

    next();
};
