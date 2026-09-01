const fs = require("fs");
const path = require("path");
const pool = require("./src/database/db");

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error("Usage: node run-migration.js <migration-file.sql>");
  process.exit(1);
}

const sqlPath = path.resolve(__dirname, migrationFile);
const sql = fs.readFileSync(sqlPath, "utf8");

pool
  .query(sql)
  .then(() => {
    console.log(`Migration applied: ${migrationFile}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err.message);
    process.exit(1);
  });
