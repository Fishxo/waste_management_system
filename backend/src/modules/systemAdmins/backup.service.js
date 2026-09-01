const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const pool = require("../../database/db");

const execFileAsync = promisify(execFile);

const BACKUP_DIR = path.join(__dirname, "../../backups");

function ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
}

function parseDatabaseUrl(databaseUrl) {
    const parsed = new URL(databaseUrl);

    return {
        host: parsed.hostname,
        port: parsed.port || "5432",
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname.replace(/^\//, ""),
    };
}

function formatTimestamp(date = new Date()) {
    return date.toISOString().replace(/[:.]/g, "-");
}

exports.createBackup = async (systemAdminId) => {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not configured");
    }

    ensureBackupDir();

    const db = parseDatabaseUrl(process.env.DATABASE_URL);
    const filename = `backup-${formatTimestamp()}.sql`;
    const filePath = path.join(BACKUP_DIR, filename);

    const env = { ...process.env, PGPASSWORD: db.password };

    await execFileAsync(
        "pg_dump",
        [
            "-h",
            db.host,
            "-p",
            String(db.port),
            "-U",
            db.user,
            "-d",
            db.database,
            "-F",
            "p",
            "-f",
            filePath,
            "--no-owner",
            "--no-privileges",
        ],
        { env }
    );

    const stats = fs.statSync(filePath);

    const result = await pool.query(
        `
        INSERT INTO backup_logs (filename, file_path, size_bytes, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING id, filename, file_path, size_bytes, created_by, created_at
        `,
        [filename, filePath, stats.size, systemAdminId]
    );

    return result.rows[0];
};

exports.listBackups = async () => {
    const result = await pool.query(
        `
        SELECT
            b.id,
            b.filename,
            b.size_bytes,
            b.created_at,
            s.username AS created_by_username
        FROM backup_logs b
        LEFT JOIN system_admins s ON b.created_by = s.id
        ORDER BY b.created_at DESC
        `
    );

    return result.rows;
};

exports.getBackupById = async (id) => {
    const result = await pool.query(
        `
        SELECT id, filename, file_path, size_bytes, created_at, created_by
        FROM backup_logs
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];
};

exports.restoreFromSql = async (sqlContent, systemAdminId) => {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not configured");
    }

    ensureBackupDir();

    await exports.createBackup(systemAdminId);

    const db = parseDatabaseUrl(process.env.DATABASE_URL);
    const tempFile = path.join(
        BACKUP_DIR,
        `restore-temp-${formatTimestamp()}.sql`
    );

    fs.writeFileSync(tempFile, sqlContent, "utf8");

    const env = { ...process.env, PGPASSWORD: db.password };

    try {
        await execFileAsync(
            "psql",
            [
                "-h",
                db.host,
                "-p",
                String(db.port),
                "-U",
                db.user,
                "-d",
                db.database,
                "-v",
                "ON_ERROR_STOP=1",
                "-f",
                tempFile,
            ],
            { env }
        );
    } finally {
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
    }

    return { restored: true };
};
