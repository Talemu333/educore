require("dotenv").config();

const { spawnSync } = require("node:child_process");
const { Pool } = require("pg");
const { getDatabaseConfig } = require("../config/databaseConfig");
const centralPool = require("../config/database");

const IDENTIFIER_PATTERN = /^[A-Za-z0-9_]+$/;

const quoteIdentifier = (value) => {
    if (!IDENTIFIER_PATTERN.test(value)) {
        throw new Error(`Unsafe PostgreSQL identifier: ${value}`);
    }
    return `"${value}"`;
};

const commandExists = (command) => {
    const result = spawnSync(command, ["--version"], {
        stdio: "ignore",
        shell: process.platform === "win32",
    });
    return result.status === 0;
};

const buildClientEnv = () => ({
    ...process.env,
    PGPASSWORD: process.env.DB_PASSWORD,
    PGSSLMODE: process.env.DB_HOST?.includes("neon.tech") ? "require" : process.env.PGSSLMODE,
});

const run = (command, args, options = {}) => {
    const result = spawnSync(command, args, {
        stdio: options.stdio || ["ignore", "pipe", "pipe"],
        input: options.input,
        env: buildClientEnv(),
        shell: process.platform === "win32",
        maxBuffer: 20 * 1024 * 1024,
    });

    if (result.error) throw result.error;

    if (result.status !== 0) {
        const stderr = result.stderr ? String(result.stderr) : "";
        throw new Error(`${command} failed with exit code ${result.status}: ${stderr}`);
    }

    return result.stdout ? String(result.stdout) : "";
};

const getSchool = async (schoolId) => {
    const result = await centralPool.query(`
        SELECT school_id, database_name, website_slug, is_active
        FROM school_database_registry
        WHERE school_id = $1
        LIMIT 1
    `, [schoolId]);

    return result.rows[0] || null;
};

const provision = async (schoolId) => {
    if (!Number.isInteger(schoolId) || schoolId < 1) {
        throw new Error("Usage: node scripts/provisionSchoolDatabase.js <schoolId>");
    }

    if (!commandExists("pg_dump") || !commandExists("psql")) {
        throw new Error(
            "pg_dump and psql are required. Install the PostgreSQL client tools before running this provisioning script."
        );
    }

    const school = await getSchool(schoolId);
    if (!school) {
        throw new Error(`School ${schoolId} has no central database registry entry.`);
    }

    const databaseName = school.database_name;
    quoteIdentifier(databaseName);

    const maintenancePool = new Pool(getDatabaseConfig("postgres"));
    let databaseCreated = false;

    try {
        const existsResult = await maintenancePool.query(
            "SELECT 1 FROM pg_database WHERE datname = $1 LIMIT 1",
            [databaseName]
        );

        if (!existsResult.rowCount) {
            await maintenancePool.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
            databaseCreated = true;
            console.log(`Created database: ${databaseName}`);
        } else {
            console.log(`Database already exists: ${databaseName}`);
        }
    } finally {
        await maintenancePool.end();
    }

    // TEMPORARY PREPARATION ONLY.
    // The current application database contains both central and school-owned
    // tables. A full schema dump would therefore copy central structures into
    // the school database. That is useful for investigation, but it is NOT a
    // valid final school-database initializer.
    const dump = run("pg_dump", [
        "--schema-only",
        "--no-owner",
        "--no-privileges",
        "--host", process.env.DB_HOST,
        "--port", String(process.env.DB_PORT || 5432),
        "--username", process.env.DB_USER,
        "--dbname", process.env.DB_NAME,
    ]);

    run("psql", [
        "--host", process.env.DB_HOST,
        "--port", String(process.env.DB_PORT || 5432),
        "--username", process.env.DB_USER,
        "--dbname", databaseName,
        "--set", "ON_ERROR_STOP=1",
    ], { stdio: ["pipe", "pipe", "pipe"], input: dump });

    // Deliberately do NOT activate the registry here. Activation is only safe
    // after the dedicated school schema and ownership boundaries have been
    // finalized and the school's required data has been seeded.
    console.log(JSON.stringify({
        success: true,
        schoolId,
        databaseName,
        databaseCreated,
        active: false,
        message: "Database prepared only; registry remains inactive pending the dedicated school initializer.",
    }, null, 2));
};

const schoolId = Number(process.argv[2]);

provision(schoolId)
    .catch((error) => {
        console.error("School database preparation failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await centralPool.end();
    });
