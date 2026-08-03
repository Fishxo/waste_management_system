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
exports.updateReportStatus = async (reportId, status, adminId) => {
    const report = await reportRepository.updateReportStatus(
        reportId,
        status,
        adminId
    );

    if (!report) {
        throw new Error("Report not found");
    }

    return report;
};

//getting whole reports including status
exports.getAllReports = async (status) => {
    const reports = await adminRepository.getAllReports(status);

    return reports;
};

//get admin dashboard numbers 
exports.getDashboardStatistics = async () => {
    const statistics = await adminRepository.getDashboardStatistics();

    return {
        totalResidents: Number(statistics.total_residents),
        totalReports: Number(statistics.total_reports),
        pendingReports: Number(statistics.pending_reports),
        inProgressReports: Number(statistics.in_progress_reports),
        resolvedReports: Number(statistics.resolved_reports),
    };
};

//getting the whole residnets 
exports.getAllResidents = async () => {
    return await adminRepository.getAllResidents();
};

//getting the residnet by id 
exports.getResidentById = async (id) => {
    return await adminRepository.getResidentById(id);
};