const BUSINESS_TYPES = [
    "Hotel",
    "Restaurant",
    "Café",
    "Supermarket",
    "Office",
    "Factory",
    "Other",
];

exports.updateBusinessOwnerProfile = (req, res, next) => {
    const {
        businessName,
        ownerName,
        phoneNumber,
        address,
        businessType,
        kebele,
        kifleKetema,
        sefer,
    } = req.body;

    if (
        !businessName ||
        !ownerName ||
        !phoneNumber ||
        !address ||
        !businessType ||
        !kebele ||
        !kifleKetema ||
        !sefer
    ) {
        return res.status(400).json({
            message: "All fields are required",
        });
    }

    if (ownerName.length < 3) {
        return res.status(400).json({
            message: "Owner name should be at least 3 characters",
        });
    }

    if (businessName.length < 2) {
        return res.status(400).json({
            message: "Business name should be at least 2 characters",
        });
    }

    if (!/^(09|07)\d{8}$/.test(phoneNumber)) {
        return res.status(400).json({
            message:
                "Phone number should be 10 characters and start with 09 or 07",
        });
    }

    if (!BUSINESS_TYPES.includes(businessType)) {
        return res.status(400).json({
            message: "Invalid business type",
        });
    }

    next();
};

exports.changeBusinessOwnerPassword = (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            message: "Current password and new password are required",
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            message: "New password should be at least 6 characters",
        });
    }

    next();
};
