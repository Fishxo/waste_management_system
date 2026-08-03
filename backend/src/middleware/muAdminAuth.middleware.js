const jwt = require("jsonwebtoken");

exports.authenticateMuAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication token is required",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.role !== "municipal_admin") {
            return res.status(403).json({
                message: "Access denied",
            });
        }

        req.user = decoded;

        next();

    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};