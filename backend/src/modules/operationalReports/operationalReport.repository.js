const pool = require("../../database/db");

const VALID_TYPES = ["schedules", "collections", "on_demand", "performance"];

function scopeClause(alias, kifleKetema, startIndex = 1) {
    if (!kifleKetema) {
        return { clause: "", values: [] };
    }
    return {
        clause: ` AND ${alias}.kifle_ketema = $${startIndex}`,
        values: [kifleKetema],
    };
}

function dateClause(column, dateFrom, dateTo, startIndex) {
    const values = [];
    const parts = [];
    let idx = startIndex;

    if (dateFrom) {
        parts.push(`${column} >= $${idx++}`);
        values.push(dateFrom);
    }
    if (dateTo) {
        parts.push(`${column} <= $${idx++}`);
        values.push(dateTo);
    }

    return {
        clause: parts.length ? ` AND ${parts.join(" AND ")}` : "",
        values,
        nextIndex: idx,
    };
}

exports.VALID_TYPES = VALID_TYPES;

exports.createReport = async ({
    reportType,
    title,
    dateFrom,
    dateTo,
    kifleKetema,
    reportData,
    generatedBy,
}) => {
    const query = `
        INSERT INTO operational_reports
        (report_type, title, date_from, date_to, kifle_ketema, report_data, generated_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;

    const result = await pool.query(query, [
        reportType,
        title,
        dateFrom || null,
        dateTo || null,
        kifleKetema || null,
        JSON.stringify(reportData),
        generatedBy,
    ]);

    return result.rows[0];
};

exports.getReports = async ({ reportType, dateFrom, dateTo, kifleKetema }) => {
    let query = `
        SELECT
            id,
            report_type,
            title,
            date_from,
            date_to,
            kifle_ketema,
            report_data,
            generated_by,
            created_at
        FROM operational_reports
        WHERE 1=1
    `;

    const values = [];

    if (kifleKetema) {
        values.push(kifleKetema);
        query += ` AND (kifle_ketema = $${values.length} OR kifle_ketema IS NULL)`;
    }

    if (reportType) {
        values.push(reportType);
        query += ` AND report_type = $${values.length}`;
    }

    if (dateFrom) {
        values.push(dateFrom);
        query += ` AND created_at::date >= $${values.length}`;
    }

    if (dateTo) {
        values.push(dateTo);
        query += ` AND created_at::date <= $${values.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, values);

    return result.rows;
};

exports.getReportById = async (id, kifleKetema) => {
    let query = `
        SELECT
            id,
            report_type,
            title,
            date_from,
            date_to,
            kifle_ketema,
            report_data,
            generated_by,
            created_at
        FROM operational_reports
        WHERE id = $1
    `;

    const values = [id];

    if (kifleKetema) {
        values.push(kifleKetema);
        query += ` AND (kifle_ketema = $2 OR kifle_ketema IS NULL)`;
    }

    const result = await pool.query(query, values);

    return result.rows[0];
};

exports.generateSchedulesReport = async (dateFrom, dateTo, kifleKetema) => {
    const values = [];
    let where = "WHERE 1=1";

    const scope = scopeClause("s", kifleKetema, 1);
    where += scope.clause;
    values.push(...scope.values);

    const date = dateClause("s.collection_date", dateFrom, dateTo, values.length + 1);
    where += date.clause;
    values.push(...date.values);

    const summaryQuery = `
        SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE s.status = 'scheduled')::int AS scheduled,
            COUNT(*) FILTER (WHERE s.status = 'assigned')::int AS assigned,
            COUNT(*) FILTER (WHERE s.status = 'in_progress')::int AS in_progress,
            COUNT(*) FILTER (WHERE s.status = 'completed')::int AS completed
        FROM schedules s
        ${where}
    `;

    const byStatusQuery = `
        SELECT s.status, COUNT(*)::int AS count
        FROM schedules s
        ${where}
        GROUP BY s.status
        ORDER BY count DESC
    `;

    const byAreaQuery = `
        SELECT s.kifle_ketema, s.kebele, COUNT(*)::int AS count
        FROM schedules s
        ${where}
        GROUP BY s.kifle_ketema, s.kebele
        ORDER BY count DESC
        LIMIT 20
    `;

    const rowsQuery = `
        SELECT
            s.id,
            s.kifle_ketema,
            s.kebele,
            s.sefer,
            s.collection_date,
            s.collection_time,
            s.status,
            c.full_name AS collector_name
        FROM schedules s
        LEFT JOIN collectors c ON s.collector_id = c.id
        ${where}
        ORDER BY s.collection_date DESC, s.collection_time DESC
        LIMIT 100
    `;

    const [summaryRes, byStatusRes, byAreaRes, rowsRes] = await Promise.all([
        pool.query(summaryQuery, values),
        pool.query(byStatusQuery, values),
        pool.query(byAreaQuery, values),
        pool.query(rowsQuery, values),
    ]);

    return {
        summary: summaryRes.rows[0],
        byStatus: byStatusRes.rows,
        byArea: byAreaRes.rows,
        rows: rowsRes.rows,
    };
};

exports.generateCollectionsReport = async (dateFrom, dateTo, kifleKetema) => {
    const scheduleValues = [];
    let scheduleWhere = "WHERE 1=1";

    const scheduleScope = scopeClause("s", kifleKetema, 1);
    scheduleWhere += scheduleScope.clause;
    scheduleValues.push(...scheduleScope.values);

    const scheduleDate = dateClause(
        "s.collection_date",
        dateFrom,
        dateTo,
        scheduleValues.length + 1
    );
    scheduleWhere += scheduleDate.clause;
    scheduleValues.push(...scheduleDate.values);

    const scheduleQuery = `
        SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE s.status = 'completed')::int AS completed,
            COUNT(*) FILTER (WHERE s.status != 'completed')::int AS pending
        FROM schedules s
        ${scheduleWhere}
    `;

    const onDemandValues = [];
    let onDemandWhere = "WHERE r.status = 'approved'";

    if (kifleKetema) {
        onDemandValues.push(kifleKetema);
        onDemandWhere += ` AND b.kifle_ketema = $${onDemandValues.length}`;
    }

    const onDemandDate = dateClause(
        "r.created_at::date",
        dateFrom,
        dateTo,
        onDemandValues.length + 1
    );
    onDemandWhere += onDemandDate.clause;
    onDemandValues.push(...onDemandDate.values);

    const onDemandQuery = `
        SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE r.collection_status = 'completed')::int AS completed,
            COUNT(*) FILTER (WHERE r.collection_status = 'confirmed')::int AS confirmed,
            COUNT(*) FILTER (
                WHERE r.collection_status NOT IN ('completed', 'confirmed')
            )::int AS pending
        FROM on_demand_requests r
        JOIN business_owners b ON r.business_id = b.business_id
        ${onDemandWhere}
    `;

    const [scheduleRes, onDemandRes] = await Promise.all([
        pool.query(scheduleQuery, scheduleValues),
        pool.query(onDemandQuery, onDemandValues),
    ]);

    const schedule = scheduleRes.rows[0];
    const onDemand = onDemandRes.rows[0];

    const scheduleTotal = Number(schedule.total) || 0;
    const scheduleCompleted = Number(schedule.completed) || 0;
    const onDemandTotal = Number(onDemand.total) || 0;
    const onDemandCompleted =
        Number(onDemand.completed) + Number(onDemand.confirmed);

    const combinedTotal = scheduleTotal + onDemandTotal;
    const combinedCompleted = scheduleCompleted + onDemandCompleted;

    return {
        summary: {
            schedule_total: scheduleTotal,
            schedule_completed: scheduleCompleted,
            schedule_completion_rate: scheduleTotal
                ? Math.round((scheduleCompleted / scheduleTotal) * 100)
                : 0,
            on_demand_total: onDemandTotal,
            on_demand_completed: onDemandCompleted,
            on_demand_completion_rate: onDemandTotal
                ? Math.round((onDemandCompleted / onDemandTotal) * 100)
                : 0,
            combined_total: combinedTotal,
            combined_completed: combinedCompleted,
            combined_completion_rate: combinedTotal
                ? Math.round((combinedCompleted / combinedTotal) * 100)
                : 0,
        },
        scheduleBreakdown: schedule,
        onDemandBreakdown: onDemand,
    };
};

exports.generateOnDemandReport = async (dateFrom, dateTo, kifleKetema) => {
    const values = [];
    let where = "WHERE 1=1";

    if (kifleKetema) {
        values.push(kifleKetema);
        where += ` AND b.kifle_ketema = $${values.length}`;
    }

    const date = dateClause("r.created_at::date", dateFrom, dateTo, values.length + 1);
    where += date.clause;
    values.push(...date.values);

    const summaryQuery = `
        SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE r.status = 'pending')::int AS pending,
            COUNT(*) FILTER (WHERE r.status = 'approved')::int AS approved,
            COUNT(*) FILTER (WHERE r.status = 'rejected')::int AS rejected,
            COUNT(*) FILTER (WHERE r.collection_status = 'assigned')::int AS assigned,
            COUNT(*) FILTER (WHERE r.collection_status = 'in_progress')::int AS in_progress,
            COUNT(*) FILTER (WHERE r.collection_status = 'completed')::int AS completed,
            COUNT(*) FILTER (WHERE r.collection_status = 'confirmed')::int AS confirmed
        FROM on_demand_requests r
        JOIN business_owners b ON r.business_id = b.business_id
        ${where}
    `;

    const rowsQuery = `
        SELECT
            r.id,
            b.business_name,
            b.kifle_ketema,
            b.kebele,
            r.status,
            r.collection_status,
            r.created_at,
            r.assigned_at,
            r.completed_at,
            c.full_name AS collector_name
        FROM on_demand_requests r
        JOIN business_owners b ON r.business_id = b.business_id
        LEFT JOIN collectors c ON r.collector_id = c.id
        ${where}
        ORDER BY r.created_at DESC
        LIMIT 100
    `;

    const [summaryRes, rowsRes] = await Promise.all([
        pool.query(summaryQuery, values),
        pool.query(rowsQuery, values),
    ]);

    const summary = summaryRes.rows[0];
    const total = Number(summary.total) || 0;
    const approved = Number(summary.approved) || 0;

    return {
        summary: {
            ...summary,
            approval_rate: total ? Math.round((approved / total) * 100) : 0,
        },
        rows: rowsRes.rows,
    };
};

exports.generatePerformanceReport = async (dateFrom, dateTo, kifleKetema) => {
    const values = [];
    let where = "WHERE c.is_active = true";

    if (kifleKetema) {
        values.push(kifleKetema);
        where += ` AND c.kifle_ketema = $${values.length}`;
    }

    let scheduleJoin = "LEFT JOIN schedules s ON s.collector_id = c.id";
    if (dateFrom) {
        values.push(dateFrom);
        scheduleJoin += ` AND s.collection_date >= $${values.length}`;
    }
    if (dateTo) {
        values.push(dateTo);
        scheduleJoin += ` AND s.collection_date <= $${values.length}`;
    }

    let onDemandJoin =
        "LEFT JOIN on_demand_requests r ON r.collector_id = c.id AND r.status = 'approved'";
    if (dateFrom) {
        values.push(dateFrom);
        onDemandJoin += ` AND r.created_at::date >= $${values.length}`;
    }
    if (dateTo) {
        values.push(dateTo);
        onDemandJoin += ` AND r.created_at::date <= $${values.length}`;
    }

    const query = `
        SELECT
            c.id,
            c.full_name,
            c.kifle_ketema,
            c.is_active,
            COUNT(DISTINCT s.id)::int AS schedules_assigned,
            COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed')::int AS schedules_completed,
            COUNT(DISTINCT r.id)::int AS on_demand_assigned,
            COUNT(DISTINCT r.id) FILTER (
                WHERE r.collection_status IN ('completed', 'confirmed')
            )::int AS on_demand_completed
        FROM collectors c
        ${scheduleJoin}
        ${onDemandJoin}
        ${where}
        GROUP BY c.id, c.full_name, c.kifle_ketema, c.is_active
        ORDER BY schedules_completed DESC, on_demand_completed DESC
    `;

    const result = await pool.query(query, values);

    const collectors = result.rows.map((row) => {
        const schedulesAssigned = Number(row.schedules_assigned) || 0;
        const schedulesCompleted = Number(row.schedules_completed) || 0;
        const onDemandAssigned = Number(row.on_demand_assigned) || 0;
        const onDemandCompleted = Number(row.on_demand_completed) || 0;
        const totalAssigned = schedulesAssigned + onDemandAssigned;
        const totalCompleted = schedulesCompleted + onDemandCompleted;

        return {
            ...row,
            total_assigned: totalAssigned,
            total_completed: totalCompleted,
            completion_rate: totalAssigned
                ? Math.round((totalCompleted / totalAssigned) * 100)
                : 0,
        };
    });

    const feedbackValues = [];
    let feedbackWhere = "WHERE 1=1";

    if (kifleKetema) {
        feedbackValues.push(kifleKetema);
        feedbackWhere += `
            AND (
                (f.submitter_role = 'resident' AND res.kifle_ketema = $1)
                OR (f.submitter_role = 'business_owner' AND b.kifle_ketema = $1)
            )`;
    }

    const feedbackDate = dateClause(
        "f.created_at::date",
        dateFrom,
        dateTo,
        feedbackValues.length + 1
    );
    feedbackWhere += feedbackDate.clause;
    feedbackValues.push(...feedbackDate.values);

    const feedbackQuery = `
        SELECT
            ROUND(AVG(f.rating)::numeric, 2) AS average_rating,
            COUNT(*)::int AS feedback_count
        FROM feedback f
        LEFT JOIN residents res
            ON f.submitter_role = 'resident' AND f.submitter_id = res.id
        LEFT JOIN business_owners b
            ON f.submitter_role = 'business_owner' AND f.submitter_id = b.business_id
        ${feedbackWhere}
    `;

    const feedbackRes = await pool.query(feedbackQuery, feedbackValues);

    return {
        summary: {
            active_collectors: collectors.length,
            average_rating: feedbackRes.rows[0]?.average_rating || null,
            feedback_count: Number(feedbackRes.rows[0]?.feedback_count) || 0,
            total_assignments: collectors.reduce(
                (sum, c) => sum + c.total_assigned,
                0
            ),
            total_completions: collectors.reduce(
                (sum, c) => sum + c.total_completed,
                0
            ),
        },
        collectors,
    };
};
