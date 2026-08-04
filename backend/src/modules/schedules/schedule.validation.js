

// validating schedule creation
exports.createSchedule = (req, res, next) => {
    const {
        kifleKetema,
        kebele,
        sefer,
        collectionDay,
        collectionTime,
        notes,
    } = req.body;

    if (
        !kifleKetema ||
        !kebele ||
        !sefer ||
        !collectionDay ||
        !collectionTime
    ) {
        return res.status(400).json({
            message: "All required fields must be provided",
        });
    }

    next();
};

//making update schedules from the admin 
exports.updateSchedule = (req, res, next) => {
    const { kifleKetema, kebele, sefer, collectionDay, collectionTime } = req.body;

    //validation
    if (
        !kifleKetema ||
        !sefer ||
        !collectionDay ||
        !collectionTime
    ) {
        return res.status(400).json({
            message : "all field is requied should be provided"
        })
    }
    next();
} 