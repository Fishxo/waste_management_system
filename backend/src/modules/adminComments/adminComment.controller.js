const adminCommentService = require("./adminComment.service");

exports.sendMessage = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const comment = await adminCommentService.sendMessage(
            req.user.id,
            subject,
            message
        );

        res.status(201).json({
            message: "Message sent to system admin",
            data: comment,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getMyThreads = async (req, res) => {
    try {
        const threads = await adminCommentService.getMyThreads(req.user.id);

        res.status(200).json({
            message: "Messages retrieved successfully",
            data: threads,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getMyThread = async (req, res) => {
    try {
        const thread = await adminCommentService.getMyThread(
            Number(req.params.id),
            req.user.id
        );

        if (!thread) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (thread.accessDenied) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json({
            message: "Message retrieved successfully",
            data: thread,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.reply = async (req, res) => {
    try {
        const reply = await adminCommentService.replyToThread(
            Number(req.params.id),
            req.user.id,
            req.body.message
        );

        if (!reply) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.status(201).json({
            message: "Reply sent successfully",
            data: reply,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getUnreadRepliesCount = async (req, res) => {
    try {
        const count = await adminCommentService.getUnreadRepliesCount(req.user.id);

        res.status(200).json({ data: { count } });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAllThreads = async (req, res) => {
    try {
        const threads = await adminCommentService.getAllThreads();

        res.status(200).json({
            message: "Messages retrieved successfully",
            data: threads,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getThreadForSystemAdmin = async (req, res) => {
    try {
        const thread = await adminCommentService.getThreadForSystemAdmin(
            Number(req.params.id)
        );

        if (!thread) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.status(200).json({
            message: "Message retrieved successfully",
            data: thread,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.replyAsSystemAdmin = async (req, res) => {
    try {
        const reply = await adminCommentService.replyAsSystemAdmin(
            Number(req.params.id),
            req.body.message
        );

        if (!reply) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.status(201).json({
            message: "Reply sent successfully",
            data: reply,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const count = await adminCommentService.getUnreadCount();

        res.status(200).json({ data: { count } });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};