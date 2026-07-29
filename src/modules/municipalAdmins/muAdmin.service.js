const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const reportRepository = require("../reports/report.repository");
const adminRepository = require("./muAdmin.repository");

exports.login = async (email, password) => {
    const admin = await adminRepository.findAdminByEmail(email);

    if (!admin) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        admin.password
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        {
            id: admin.id,
            role: "municipal_admin",
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );

    return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        token,
    };
};

//update the report status 
exports.updateReportStatus = async (reportId, status) => {
    const report = await reportRepository.updateReportStatus(
        reportId,
        status
    );

    if (!report) {
        throw new Error("Report not found");
    }

    return report;
};