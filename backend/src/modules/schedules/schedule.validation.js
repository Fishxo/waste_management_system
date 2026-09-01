exports.createSchedule = (req, res, next) => {
    const {
        kifleKetema,
        kebele,
        sefer,
        collectionDate,
        collectionTime,
        notes,
    } = req.body;

    if (
        !kifleKetema ||
        !kebele ||
        !sefer ||
        !collectionDate ||
        !collectionTime
    ) {
        return res.status(400).json({
            message: "All required fields must be provided",
        });
    }

    next();
};

exports.updateSchedule = (req, res, next) => {
    const { kifleKetema, kebele, sefer, collectionDate, collectionTime } =
        req.body;

    if (
        !kifleKetema ||
        !sefer ||
        !collectionDate ||
        !collectionTime
    ) {
        return res.status(400).json({
            message: "All required fields must be provided",
        });
    }
    next();
};
