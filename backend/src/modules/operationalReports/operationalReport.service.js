const operationalReportRepository = require("./operationalReport.repository");

const REPORT_TITLES = {
    schedules: "Schedules Report",
    collections: "Collections Report",
    on_demand: "On-Demand Requests Report",
    performance: "Collector Performance Report",
};

function buildTitle(reportType, dateFrom, dateTo) {
    const base = REPORT_TITLES[reportType] || "Operational Report";
    if (dateFrom && dateTo) {
        return `${base} (${dateFrom} to ${dateTo})`;
    }
    if (dateFrom) {
        return `${base} (from ${dateFrom})`;
    }
    if (dateTo) {
        return `${base} (until ${dateTo})`;
    }
    return `${base} (all time)`;
}

async function generateReportData(reportType, dateFrom, dateTo, kifleKetema) {
    switch (reportType) {
        case "schedules":
            return operationalReportRepository.generateSchedulesReport(
                dateFrom,
                dateTo,
                kifleKetema
            );
        case "collections":
            return operationalReportRepository.generateCollectionsReport(
                dateFrom,
                dateTo,
                kifleKetema
            );
        case "on_demand":
            return operationalReportRepository.generateOnDemandReport(
                dateFrom,
                dateTo,
                kifleKetema
            );
        case "performance":
            return operationalReportRepository.generatePerformanceReport(
                dateFrom,
                dateTo,
                kifleKetema
            );
        default:
            throw new Error("Invalid report type");
    }
}

function flattenReportForCsv(report) {
    const data = report.report_data || {};
    const rows = [];

    if (data.rows?.length) {
        return data.rows;
    }

    if (data.collectors?.length) {
        return data.collectors;
    }

    if (data.byStatus?.length) {
        return data.byStatus;
    }

    if (data.byArea?.length) {
        return data.byArea;
    }

    if (data.summary) {
        rows.push(data.summary);
    }

    return rows;
}

function toCsv(rows) {
    if (!rows.length) {
        return "No data";
    }

    const headers = Object.keys(rows[0]);
    const escape = (value) => {
        const str = value == null ? "" : String(value);
        if (/[",\n]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const lines = [
        headers.join(","),
        ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
    ];

    return lines.join("\n");
}

exports.generateReport = async ({
    reportType,
    dateFrom,
    dateTo,
    kifleKetema,
    adminId,
}) => {
    if (!operationalReportRepository.VALID_TYPES.includes(reportType)) {
        throw new Error("Invalid report type");
    }

    const reportData = await generateReportData(
        reportType,
        dateFrom,
        dateTo,
        kifleKetema
    );

    const report = await operationalReportRepository.createReport({
        reportType,
        title: buildTitle(reportType, dateFrom, dateTo),
        dateFrom,
        dateTo,
        kifleKetema,
        reportData,
        generatedBy: adminId,
    });

    return report;
};

exports.getReports = async (filters) => {
    return operationalReportRepository.getReports(filters);
};

exports.getReportById = async (id, kifleKetema) => {
    const report = await operationalReportRepository.getReportById(
        id,
        kifleKetema
    );

    if (!report) {
        throw new Error("Report not found");
    }

    return report;
};

exports.downloadReportCsv = async (id, kifleKetema) => {
    const report = await exports.getReportById(id, kifleKetema);
    const rows = flattenReportForCsv(report);
    const csv = toCsv(rows);

    return {
        filename: `operational-report-${report.report_type}-${report.id}.csv`,
        content: csv,
        report,
    };
};
