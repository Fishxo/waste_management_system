const reportRepository = require("./report.repository");
const residentRepository = require("../residents/resident.repository");

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

