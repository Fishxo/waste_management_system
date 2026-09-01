const feedbackRepository = require("./feedback.repository");

const VALID_ROLES = ["resident", "business_owner"];

exports.createFeedback = async (submitterRole, submitterId, data) => {
    if (!VALID_ROLES.includes(submitterRole)) {
        throw new Error("Access denied");
    }

    return await feedbackRepository.createFeedback({
        submitterRole,
        submitterId,
        rating: data.rating,
        comment: data.comment,
    });
};

exports.getMyFeedback = async (submitterRole, submitterId) => {
    if (!VALID_ROLES.includes(submitterRole)) {
        throw new Error("Access denied");
    }

    return await feedbackRepository.getFeedbackBySubmitter(
        submitterRole,
        submitterId
    );
};

exports.getAllFeedback = async (kifleKetema) => {
    return await feedbackRepository.getAllFeedback(kifleKetema);
};
