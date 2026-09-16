exports.sendMessage = (req, res, next) => {
    const { subject, message } = req.body;

    if (!subject || typeof subject !== "string" || !subject.trim()) {
        return res.status(400).json({ message: "Subject is required" });
    }

    if (subject.trim().length < 3) {
        return res.status(400).json({
            message: "Subject should be at least 3 characters",
        });
    }

    if (subject.trim().length > 200) {
        return res.status(400).json({
            message: "Subject should not exceed 200 characters",
        });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ message: "Message is required" });
    }

    if (message.trim().length > 2000) {
        return res.status(400).json({
            message: "Message should not exceed 2000 characters",
        });
    }

    next();
};

exports.reply = (req, res, next) => {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ message: "Message is required" });
    }

    if (message.trim().length > 2000) {
        return res.status(400).json({
            message: "Message should not exceed 2000 characters",
        });
    }

    next();
};