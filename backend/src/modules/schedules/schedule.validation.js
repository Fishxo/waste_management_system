function isPastDate(value) {
    if (!value) return false;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inputDate = new Date(value);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate < today;
}

function validateScheduleDateTime(body, res) {
    const { collectionDate, collectionTime, collectionEndTime } = body;

    if (!collectionDate || !collectionTime || !collectionEndTime) {
        res.status(400).json({
            message: "Collection date, start time, and end time are required",
        });
        return false;
    }

    if (isPastDate(collectionDate)) {
        res.status(400).json({
            message: "Collection date cannot be in the past",
        });
        return false;
    }

    const start = String(collectionTime).slice(0, 5);
    const end = String(collectionEndTime).slice(0, 5);

    if (end <= start) {
        res.status(400).json({
            message: "End time must be after the start time",
        });
        return false;
    }

    return true;
}

exports.createSchedule = (req, res, next) => {
    const { kifleKetema, kebele, sefer } = req.body;

    if (!kifleKetema || !kebele || !sefer) {
        return res.status(400).json({
            message: "All required fields must be provided",
        });
    }

    if (!validateScheduleDateTime(req.body, res)) return;

    next();
};

exports.updateSchedule = (req, res, next) => {
    const { kifleKetema, kebele, sefer } = req.body;

    if (!kifleKetema || !kebele || !sefer) {
        return res.status(400).json({
            message: "All required fields must be provided",
        });
    }

    if (!validateScheduleDateTime(req.body, res)) return;

    next();
};