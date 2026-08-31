const reportRepository = require("./report.repository");
const residentRepository = require("../residents/resident.repository");

function isLegacyScheduleIssueReport(report) {
    return (
        report?.description?.includes("Related collection schedule:") ?? false
    );
}

exports.createReport = async (residentId, data) => {
    const resident = await residentRepository.findResidentActiveStatus(residentId);

    if (!resident) {
        throw new Error("Resident not found");
    }

    if (resident.is_active === false) {
        throw new Error("Your account has been deactivated");
    }
    console.log("resident from db", resident)
    
    const report = await reportRepository.createReport(
        residentId,
        data
    );

    return report;
};

//getting the whole report made by resident
exports.getReportsByResidentId = async (residentId) => {
    const reports = await reportRepository.getReportsByResidentId(residentId);

    return reports;
};

//getting report by report id 
exports.getReportById = async (reportId, residentId) => {
    const report = await reportRepository.getReportById(
        reportId,
        residentId
    );

    if (!report) {
        throw new Error("Report not found");
    }

    return report;
};

// getting report history
exports.getReportHistory = async (reportId, residentId) => {

    const report = await reportRepository.getReportById(
        reportId,
        residentId
    );

    if (!report) {
        throw new Error("Report not found");
    }

    const history = await reportRepository.getReportHistory(reportId);

    return history;
};


//making update the report from the user side 
exports.updateReport = async (reportId, data, residentId) => {

    const report = await reportRepository.findById(reportId);

    //validation for making update 
    if (!report || isLegacyScheduleIssueReport(report)) {
        throw new Error("report not found")
    }
    
    if (report.resident_id !== residentId) {
        throw new Error("resident is not found");
    }
    if (report.status == "in_progress") {
        throw new Error("report in progress state can not be edit");
    }
    const resident = await residentRepository.findResidentActiveStatus(residentId);

    if (!resident) {
        throw new Error("Resident not found");
    }

    if (resident.is_active === false) {
        throw new Error("your account has been deactivated, you can not make update");
    }
    return await reportRepository.updateReport(reportId, data);
    
};

//making delete report from the resident side 
exports.deleteReport = async (reportId, residentId) => {

    const report = await reportRepository.findById(reportId);

    if (!report || isLegacyScheduleIssueReport(report)) {
        throw new Error("Report not found");
    }

    if (report.resident_id !== residentId) {
        throw new Error("You cannot delete this report");
    }

    if (report.status !== "pending") {
        throw new Error("You cannot delete a processed report");
    }

    return await reportRepository.deleteReport(reportId);
};