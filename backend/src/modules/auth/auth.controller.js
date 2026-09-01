const authService = require("./auth.service");

exports.registerResident = async (req, res) => {
    try {
        const resident = await authService.registerResident(req.body);

        delete resident.password_hash;

        res.status(201).json({
            message: "Resident registered successfully",
            data: resident,
        });

    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({
                message: "Email already exists",
            });
        }

        res.status(500).json({
            message: "Server error",
        });
    }
};

exports.loginResident = async (req, res) => {
    try {
        const { identifier, email, password } = req.body;
        const loginId = identifier || email;

        const { resident, token } =
            await authService.loginResident(loginId, password);

        delete resident.password_hash;

        res.status(200).json({
            message: "Login successful",
            token: token,
            data: resident,
        });

    } catch (err) {
        console.log("LOGIN ERROR:", err);

        if (err.message === "Invalid email or password") {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        res.status(500).json({
            message: "Server error",
        });
    }
};

exports.registerBusinessOwner = async (req, res) => {
    try {
        const owner = await authService.registerBusinessOwner(req.body);

        delete owner.password_hash;

        res.status(201).json({
            message: "Business owner registered successfully",
            data: owner,
        });
    } catch (err) {
        if (err.code === "23505") {
            const field = err.detail?.includes("phone_number")
                ? "Phone number"
                : "Email";
            return res.status(409).json({
                message: `${field} already exists`,
            });
        }

        res.status(500).json({
            message: "Server error",
        });
    }
};

exports.loginBusinessOwner = async (req, res) => {
    try {
        const { identifier, email, password } = req.body;
        const loginId = identifier || email;

        const { owner, token } =
            await authService.loginBusinessOwner(loginId, password);

        delete owner.password_hash;

        res.status(200).json({
            message: "Login successful",
            token: token,
            data: owner,
        });
    } catch (err) {
        if (
            err.message === "Invalid email or password" ||
            err.message === "Your account has been deactivated"
        ) {
            return res.status(401).json({
                message: err.message,
            });
        }

        res.status(500).json({
            message: "Server error",
        });
    }
};