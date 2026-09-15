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
            kifleKetema: admin.kifle_ketema || null,
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
        kifleKetema: admin.kifle_ketema || null,
        token,
    };
};

exports.getLocationOptions = async (kifleKetema) => {
    return await adminRepository.getLocationOptions(kifleKetema);
};

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

exports.getAllReports = async (status, kifleKetema) => {
    return await adminRepository.getAllReports(status, kifleKetema);
};

exports.getDashboardStatistics = async (kifleKetema) => {
    const statistics = await adminRepository.getDashboardStatistics(kifleKetema);

    return {
        totalResidents: Number(statistics.total_residents),
        totalReports: Number(statistics.total_reports),
        pendingReports: Number(statistics.pending_reports),
        inProgressReports: Number(statistics.in_progress_reports),
        resolvedReports: Number(statistics.resolved_reports),
    };
};

exports.getAllResidents = async (kifleKetema) => {
    return await adminRepository.getAllResidents(kifleKetema);
};

exports.getResidentById = async (id, kifleKetema) => {
    return await adminRepository.getResidentById(id, kifleKetema);
};

exports.deleteResident = async (id, kifleKetema) => {
    const resident = await adminRepository.deleteResidentById(id, kifleKetema);

    if (!resident) {
        throw new Error("Resident not found");
    }

    return resident;
};

exports.setResidentActive = async (id, isActive, kifleKetema) => {
    const resident = await adminRepository.updateResidentActive(
        id,
        isActive,
        kifleKetema
    );

    if (!resident) {
        throw new Error("Resident not found");
    }

    return resident;
};

exports.getAllBusinessOwners = async (kifleKetema) => {
    return await adminRepository.getAllBusinessOwners(kifleKetema);
};

exports.getBusinessOwnerById = async (id, kifleKetema) => {
    return await adminRepository.getBusinessOwnerById(id, kifleKetema);
};

exports.deleteBusinessOwner = async (id, kifleKetema) => {
    const owner = await adminRepository.deleteBusinessOwnerById(id, kifleKetema);

    if (!owner) {
        throw new Error("Business owner not found");
    }

    return owner;
};

exports.setBusinessOwnerActive = async (id, isActive, kifleKetema) => {
    const owner = await adminRepository.updateBusinessOwnerActive(
        id,
        isActive,
        kifleKetema
    );

    if (!owner) {
        throw new Error("Business owner not found");
    }

    return owner;
};
