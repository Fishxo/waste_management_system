exports.login = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required",
        });
    }

    next();
};

exports.createMunicipalAdmin = (req, res, next) => {
    const { username, email, password, kifleKetema } = req.body;

    if (!username || !email || !password || !kifleKetema) {
        return res.status(400).json({
            message:
                "Username, email, password, and Kifle Ketema are required",
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "Password should be at least 6 characters",
        });
    }

    next();
};

exports.updateMunicipalAdmin = (req, res, next) => {
    const { username, email, password, kifleKetema } = req.body;

    if (!username || !email || !kifleKetema) {
        return res.status(400).json({
            message: "Username, email, and Kifle Ketema are required",
        });
    }

    if (password && password.length < 6) {
        return res.status(400).json({
            message: "Password should be at least 6 characters",
        });
    }

    next();
};

exports.createCollector = (req, res, next) => {
    const { fullName, phoneNumber, email, password, kifleKetema } = req.body;

    if (!fullName || !phoneNumber || !email || !password || !kifleKetema) {
        return res.status(400).json({
            message: "All fields are required",
        });
    }

    if (!/^(09|07)\d{8}$/.test(phoneNumber)) {
        return res.status(400).json({
            message:
                "Phone number should be 10 characters and start with 09 or 07",
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "Password should be at least 6 characters",
        });
    }

    next();
};

exports.updateCollector = (req, res, next) => {
    const { fullName, phoneNumber, email, kifleKetema, password } = req.body;

    if (!fullName || !phoneNumber || !email || !kifleKetema) {
        return res.status(400).json({
            message: "All fields are required",
        });
    }

    if (!/^(09|07)\d{8}$/.test(phoneNumber)) {
        return res.status(400).json({
            message:
                "Phone number should be 10 characters and start with 09 or 07",
        });
    }

    if (password && password.length < 6) {
        return res.status(400).json({
            message: "Password should be at least 6 characters",
        });
    }

    next();
};

exports.restoreDatabase = (req, res, next) => {
    const { sql } = req.body;

    if (!sql || !String(sql).trim()) {
        return res.status(400).json({
            message: "SQL backup content is required",
        });
    }

    next();
};
