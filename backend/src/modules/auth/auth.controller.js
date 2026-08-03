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
        const { email, password } = req.body;

        const { resident, token } =
            await authService.loginResident(email, password);

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