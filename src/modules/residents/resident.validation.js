// Validate resident profile update
exports.updateResidentProfile = (req, res, next) => {
    const {
        firstName,
        lastName,
        phoneNumber,
        kifleKetema,
        kebele,
        sefer
    } = req.body;

    // Check required fields
    if (
        !firstName ||
        !lastName ||
        !phoneNumber ||
        !kifleKetema ||
        !kebele ||
        !sefer
    ) {
        return res.status(400).json({
            message: "All fields are required",
        });
    }

    // Check first name
    if (firstName.length < 3) {
        return res.status(400).json({
            message: "First name should be at least 3 characters",
        });
    }

    // Check last name
    if (lastName.length < 3) {
        return res.status(400).json({
            message: "Last name should be at least 3 characters",
        });
    }

    // Check phone number
    if (!/^(09|07)\d{8}$/.test(phoneNumber)) {
        return res.status(400).json({
            message: "Phone number should be 10 characters and start with 09 or 07",
        });
    }

    next();
};