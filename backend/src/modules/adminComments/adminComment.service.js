const adminCommentRepository = require("./adminComment.repository");

exports.sendMessage = async (municipalAdminId, subject, message) => {
    return adminCommentRepository.createThread(municipalAdminId, subject, message);
};

exports.getMyThreads = async (municipalAdminId) => {
    return adminCommentRepository.getThreadsByAdmin(municipalAdminId);
};

exports.getMyThread = async (threadId, municipalAdminId) => {
    return adminCommentRepository.getThreadWithMessages(threadId, municipalAdminId);
};

exports.replyToThread = async (threadId, municipalAdminId, message) => {
    const result = await adminCommentRepository.addReply(
        threadId,
        municipalAdminId,
        "municipal_admin",
        message
    );
    return result.rows[0] || null;
};

exports.getUnreadRepliesCount = async (municipalAdminId) => {
    return adminCommentRepository.getUnreadRepliesForAdmin(municipalAdminId);
};

exports.getAllThreads = async () => {
    return adminCommentRepository.getAllThreads();
};

exports.getThreadForSystemAdmin = async (threadId) => {
    return adminCommentRepository.getThreadWithMessagesSysAdmin(threadId);
};

exports.replyAsSystemAdmin = async (threadId, message) => {
    const result = await adminCommentRepository.addReply(
        threadId,
        null,
        "system_admin",
        message
    );
    return result.rows[0] || null;
};

exports.getUnreadCount = async () => {
    return adminCommentRepository.getUnreadCount();
};