exports.createFeedback = (req, res, next) => {
    const { rating, area, comment, improvement } = req.body;

    if (rating === undefined || rating === null) {
        return res.status(400).json({
            message: "Rating is required",
        });
    }

    const numericRating = Number(rating);

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({
            message: "Rating must be an integer between 1 and 5",
        });
    }

    const validAreas = ["dashboard", "reports", "schedules", "requests", "notifications", "other"];
    if (area !== undefined && area !== null && !validAreas.includes(area)) {
        return res.status(400).json({ message: "Invalid feedback area" });
    }

    if (comment && String(comment).length > 1000) {
        return res.status(400).json({
            message: "Comment must be 1000 characters or less",
        });
    }

    if (improvement && String(improvement).length > 1000) {
        return res.status(400).json({
            message: "Improvement suggestion must be 1000 characters or less",
        });
    }

    next();
};
