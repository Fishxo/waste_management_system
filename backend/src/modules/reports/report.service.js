const reportRepository = require("./report.repository");
const residentRepository = require("../residents/resident.repository");
const collectorRepository = require("../collectors/collector.repository");

function isLegacyScheduleIssueReport(report) {
    return (
        report?.description?.includes("Related collection schedule:") ?? false
    );
}

function getReporterRole(role) {
    return role === "collector" ? "collector" : "resident";
}

const MAX_DAILY_REPORTS = 3;

exports.getDailyReportCount = async (user) => {
    const role = getReporterRole(user.role);
    const used = await reportRepository.countReportsToday({
        role,
        ownerId: user.id,
    });

    return {
        used,
        max: MAX_DAILY_REPORTS,
        remaining: Math.max(0, MAX_DAILY_REPORTS - used),
    };
};

exports.createReport = async (user, data) => {
    const role = getReporterRole(user.role);

    if (role === "collector") {
        const collector = await collectorRepository.findCollectorById(user.id);

        if (!collector) {
            throw new Error("Collector not found");
        }

        if (!collector.is_active) {
            throw new Error("Your account has been deactivated");
        }
    } else {
        const resident = await residentRepository.findResidentActiveStatus(user.id);

        if (!resident) {
            throw new Error("Resident not found");
        }

        if (resident.is_active === false) {
            throw new Error("Your account has been deactivated");
        }
    }

    const todayCount = await reportRepository.countReportsToday({
        role,
        ownerId: user.id,
    });

    if (todayCount >= MAX_DAILY_REPORTS) {
        throw new Error("You have reached the maximum of 3 reports per day.");
    }

    const report = await reportRepository.createReport(
        { role, ownerId: user.id },
        data
    );

    return report;
};

//getting the whole report made by resident or collector
exports.getMyReports = async (user) => {
    const reports = await reportRepository.getMyReports({
        role: getReporterRole(user.role),
        ownerId: user.id,
    });

    return reports;
};

//getting report by report id 
exports.getReportById = async (reportId, user) => {
    const report = await reportRepository.getReportById(reportId, {
        role: getReporterRole(user.role),
        ownerId: user.id,
    });

    if (!report) {
        throw new Error("Report not found");
    }

    return report;
};

// getting report history
exports.getReportHistory = async (reportId, user) => {

    const report = await reportRepository.getReportById(reportId, {
        role: getReporterRole(user.role),
        ownerId: user.id,
    });

    if (!report) {
        throw new Error("Report not found");
    }

    const history = await reportRepository.getReportHistory(reportId);

    return history;
};


//making update the report from the user side 
exports.updateReport = async (reportId, data, user) => {

    const report = await reportRepository.findById(reportId);

    //validation for making update 
    if (!report || isLegacyScheduleIssueReport(report)) {
        throw new Error("report not found")
    }

    const role = getReporterRole(user.role);

    if (role === "collector") {
        if (report.collector_id !== user.id) {
            throw new Error("collector is not found");
        }

        const collector = await collectorRepository.findCollectorById(user.id);

        if (!collector) {
            throw new Error("Collector not found");
        }

        if (!collector.is_active) {
            throw new Error("your account has been deactivated, you can not make update");
        }
    } else {
        if (report.resident_id !== user.id) {
            throw new Error("resident is not found");
        }

        const resident = await residentRepository.findResidentActiveStatus(user.id);

        if (!resident) {
            throw new Error("Resident not found");
        }

        if (resident.is_active === false) {
            throw new Error("your account has been deactivated, you can not make update");
        }
    }

    if (report.status == "in_progress") {
        throw new Error("report in progress state can not be edit");
    }
    return await reportRepository.updateReport(reportId, data);
    
};

//making delete report from the resident or collector side 
exports.deleteReport = async (reportId, user) => {

    const report = await reportRepository.findById(reportId);

    if (!report || isLegacyScheduleIssueReport(report)) {
        throw new Error("Report not found");
    }

    const role = getReporterRole(user.role);
    const ownedByUser =
        role === "collector"
            ? report.collector_id === user.id
            : report.resident_id === user.id;

    if (!ownedByUser) {
        throw new Error("You cannot delete this report");
    }

    if (report.status !== "pending") {
        throw new Error("You cannot delete a processed report");
    }

    return await reportRepository.deleteReport(reportId);
};