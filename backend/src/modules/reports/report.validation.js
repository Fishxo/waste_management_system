exports.createReport = (req, res, next) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({
            message: "Title and description are required",
        });
    }

    if (title.length < 3) {
        return res.status(400).json({
            message: "Title should be at least 3 characters",
        });
    }

    if (!/[a-zA-Z]/.test(title)) {
        return res.status(400).json({
            message: "Title must contain at least one letter",
        });
    }

    if (description.length < 10) {
        return res.status(400).json({
            message: "Description should be at least 10 characters",
        });
    }

    if (!/[a-zA-Z]/.test(description)) {
        return res.status(400).json({
            message: "Description must contain at least one letter",
        });
    }

    next();
};

//updating the report from the user side 
exports.updateReport = (req, res, next) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({
            message: "title and description fields are required"
        });
    }
    next();
};

//delete the report from the user side 
exports.deleteReport = (req, res, next) => {
    const { id } = req.params;
     
    //validation
    if (!id) {
        return res.status(400).json({
            message: "this report is does not exist",
        });

    }
    next();
}