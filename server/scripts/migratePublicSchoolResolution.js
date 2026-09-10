const fs = require("fs");
const path = require("path");
const pool = require("../config/database");

const migrationFile = path.join(
    __dirname,
    "../database/migrations/20260910_ensure_public_school_resolution.sql"
);

const run = async () => {
    const sql = fs.readFileSync(migrationFile, "utf8");

    console.log("🔄 Applying public school resolution migration...");
    await pool.query(sql);
    console.log("✅ Public school resolution migration completed.");
};

run()
    .catch((error) => {
        console.error("❌ Public school resolution migration failed:");
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
